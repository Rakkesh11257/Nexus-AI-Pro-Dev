import re

lines = open('/Users/rakkeshraja/Downloads/nexus-ai-pro-final-2/frontend/src/App.jsx').readlines()

# Find ToolScreen children range
ts_open = None
children_start = None
ts_close = None

for i, line in enumerate(lines):
    if '<ToolScreen' in line and 'import' not in line:
        ts_open = i
    if ts_open and children_start is None and line.strip() == '>':
        children_start = i
    if '</ToolScreen>' in line:
        ts_close = i

print(f"ToolScreen: lines {ts_open+1}-{ts_close+1}, children from line {children_start+1}")

# Track depth through each conditional tab block
depth = 0
tab_blocks = []
current_tab = None

for i in range(children_start + 1, ts_close):
    line = lines[i]
    opens = line.count('<div')
    closes = line.count('</div>')
    old_depth = depth
    depth += opens - closes
    
    # Detect tab block starts
    if "tab ===" in line and "&&" in line:
        current_tab = line.strip()[:60]
        tab_start_depth = depth
    
    # Detect tab block ends (depth returns to same level)  
    if current_tab and line.strip().startswith(')}') and depth <= 1:
        if depth != 0:
            print(f"  WARNING: Tab ending at line {i+1} has depth {depth} (expected 0)")
            print(f"  Tab was: {current_tab}")
        current_tab = None

print(f"\nFinal depth before </ToolScreen>: {depth}")

# Find which specific tab block has unclosed divs
print("\n--- Tracking per-tab depth ---")
depth = 0
for i in range(children_start + 1, ts_close):
    line = lines[i]
    opens = line.count('<div')
    closes = line.count('</div>')
    depth += opens - closes
    
    if "tab ===" in line and "&&" in line:
        tab_name = re.search(r"tab === '(\w+)'", line)
        if tab_name:
            print(f"Line {i+1}: Starting tab '{tab_name.group(1)}' at depth {depth}")
