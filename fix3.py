with open('/Users/rakkeshraja/Downloads/nexus-ai-pro-final-2/frontend/src/App.jsx', 'r') as f:
    content = f.read()

# Remove the <div> wrapper we added - go back to raw children
content = content.replace(
    '          >\n        <div>\n        {/* Error */}',
    '          >\n        {/* Error */}'
)

# Remove the </div> wrapper before </ToolScreen>
content = content.replace(
    '          </div>\n          </ToolScreen>',
    '          </ToolScreen>'
)

# Now find the extra </div> that was the old back+tabs wrapper close
# It should be right before </ToolScreen>
# The pattern is:  )}\n          </div>\n          </ToolScreen>
# After our removal above, it's now: )}\n          </ToolScreen>
# But the old close </div> for the back+tabs wrapper is still somewhere

# Let's find what's right before </ToolScreen>
ts_end = content.find('</ToolScreen>')
before = content[ts_end-100:ts_end]
print("Before </ToolScreen>:")
print(repr(before))

# The old code structure was:
# <div> ← back+tabs wrapper (REMOVED)
#   ... all tab content ...  
# </div> ← this close is STILL THERE (extra)
# 
# So we need to find that extra </div> and remove it
# It's the </div> right before </ToolScreen> that doesn't have a matching open

# Find pattern: )}\n          </ToolScreen> -- the )} closes the last tab
# But before that there might be the extra </div>

# Actually let's look more carefully
lines = content.split('\n')
ts_line = None
for i, line in enumerate(lines):
    if '</ToolScreen>' in line:
        ts_line = i
        break

if ts_line:
    # Show lines before
    for j in range(max(0, ts_line-5), ts_line+1):
        print(f"L{j+1}: {lines[j]}")
    
    # The line before </ToolScreen> should be )}
    # Two lines before should be </div> (the extra one)
    # Let's check if removing that </div> fixes the count
    
with open('/Users/rakkeshraja/Downloads/nexus-ai-pro-final-2/frontend/src/App.jsx', 'w') as f:
    f.write(content)

print('\nDONE - reverted wrapper')
