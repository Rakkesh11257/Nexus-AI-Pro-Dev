const { DynamoDBClient, ScanCommand } = require('/var/www/nexus-ai-pro/node_modules/@aws-sdk/client-dynamodb');
const { SESClient, SendEmailCommand } = require('/var/www/nexus-ai-pro/node_modules/@aws-sdk/client-ses');
const fs = require('fs');

const dynamodb = new DynamoDBClient({ region: 'ap-south-1' });
const ses = new SESClient({ region: 'ap-south-1' });
const htmlBody = fs.readFileSync('/tmp/referral-email.html', 'utf8');

const textBody = "Hi there,\n\nWe just rolled out a few updates to your account.\n\n1. Referral signups now get 45 free credits\nWhen someone signs up using your referral link, they get 45 free credits. Enough for multiple AI images, video generation, face swap, and more.\n\n2. You earn $1 on every payment they make - forever\nEvery time someone you referred buys credits or renews, you earn $1. Every payment, forever. No cap.\n\n  10 paying users  = $10/month\n  50 paying users  = $50/month\n  100 paying users = $100/month\n  500 paying users = $500/month\n  1,000 paying users = $1,000/month\n\n3. New models: Google Veo 3.1, Sora 2 Pro, Kling V2.5, Wan 2.5, GPT-5, Claude 4.5, Gemini 3, MiniMax Voice Clone, 63+ models total.\n\nLog in and tap the Invite button to get your referral link.\nhttps://app.nexus-ai-pro.com\n\n- Team NEXUS AI Pro";

async function run() {
  let users = [];
  let lastKey = undefined;
  do {
    const res = await dynamodb.send(new ScanCommand({
      TableName: 'nexus-ai-pro-users',
      ProjectionExpression: 'email',
      ExclusiveStartKey: lastKey
    }));
    users.push(...res.Items);
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  const emails = users.filter(u => u.email && u.email.S).map(u => u.email.S);
  console.log('Total users with email: ' + emails.length);
  console.log('Starting send...');

  let success = 0, errors = 0, skipped = 0;

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    if (!email.includes('@') || email.length < 5) { skipped++; continue; }

    try {
      await ses.send(new SendEmailCommand({
        Source: 'NEXUS AI Pro <noreply@nexus-ai-pro.com>',
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: 'Important update about your NEXUS AI Pro account', Charset: 'UTF-8' },
          Body: {
            Html: { Data: htmlBody, Charset: 'UTF-8' },
            Text: { Data: textBody, Charset: 'UTF-8' },
          }
        }
      }));
      success++;
      if (success <= 3) console.log('Sent #' + success + ': ' + email);
    } catch (e) {
      console.log('Error: ' + email + ': ' + e.message);
      errors++;
    }

    if ((i + 1) % 10 === 0) await new Promise(r => setTimeout(r, 1000));
    if ((i + 1) % 50 === 0) console.log('Progress: ' + (i + 1) + '/' + emails.length + ' (ok: ' + success + ', err: ' + errors + ')');
  }

  console.log('COMPLETED! Success: ' + success + ', Errors: ' + errors + ', Skipped: ' + skipped);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
