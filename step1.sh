#!/bin/bash
/usr/bin/expect <<'EOF'
set timeout 30
spawn ssh -o StrictHostKeyChecking=no root@139.84.132.73
expect "password:"
send "Nexus@AI#Pro\$2025!\r"
expect "~#"
send "cd /var/www/nexus-ai-pro && git pull dev main --force 2>&1\r"
expect "~#"
send "exit\r"
expect eof
EOF
