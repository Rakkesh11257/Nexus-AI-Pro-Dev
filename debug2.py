with open('/Users/rakkeshraja/Downloads/nexus-ai-pro-final-2/frontend/src/App.jsx', 'r') as f:
    content = f.read()

# Current state: the line has '>        <div>\n        {/* Error */}'
# We need: '>\n          <div>\n        {/* Error */}'
# Actually the <div> wrapper IS there, the problem is the </div> before </ToolScreen>

# Let's find exact current pattern
import re

# Find the ToolScreen open and its children
ts_start = content.find('<ToolScreen')
ts_end = content.find('</ToolScreen>')

# Get the line with '>' that opens children
# Find the closing > of ToolScreen props
children_start = content.find('>\n        <div>\n        {/* Error */', ts_start)
if children_start == -1:
    children_start = content.find('>        <div>\n        {/* Error */', ts_start)
if children_start == -1:
    # Check what's actually there
    children_area = content[ts_start:ts_start+800]
    gt_pos = children_area.find('>\n        {/* Error */')
    if gt_pos == -1:
        gt_pos = children_area.find('>        {/* Error */')
    print("Area around ToolScreen opening:")
    if gt_pos != -1:
        print(repr(children_area[gt_pos-20:gt_pos+60]))
    else:
        print("Could not find pattern")
        # Show what's after onViewItem
        ovi = children_area.find('onViewItem')
        print(repr(children_area[ovi:ovi+120]))
else:
    print("Found <div> wrapper")

# Count divs in the ToolScreen children
children_content = content[ts_start:ts_end]
open_divs = children_content.count('<div')
close_divs = children_content.count('</div>')
print(f"Open divs in ToolScreen: {open_divs}, Close divs: {close_divs}")
