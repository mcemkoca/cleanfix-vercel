#!/usr/bin/env python3
import glob, re

# CDN -> SRI hash mapping
SRI_HASHES = {
    'chart.js@4.4.1/dist/chart.umd.min.js': 'sha384-9nhczxUqK87bcKHh20fSQcTGD4qq5GhayNYSYWqwBkINBhOfQLg/P5HG5lF1urn4',
    'jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js': 'sha384-vuyrTV5nkscLp1knFvt+FIHfKKzmROBq5reruhMRslauj54mW+l2B8b6szMN6lCL',
    'xlsx/0.18.5/xlsx.full.min.js': 'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw',
}

updated = 0
for path in glob.glob('/root/.openclaw/workspace/cleanfix-vercel/*.html'):
    with open(path) as f:
        content = f.read()

    modified = content
    for cdn_path, sri in SRI_HASHES.items():
        # Match script src containing this CDN path
        pattern = r'(<script src="https://[^"]*' + re.escape(cdn_path) + r'"[^>]*)(/?>)'
        
        def replacer(m, sri=sri):
            # If already has integrity, skip
            if 'integrity=' in m.group(1):
                return m.group(0)
            # Add integrity + crossorigin before the closing >
            return m.group(1) + f' integrity="{sri}" crossorigin="anonymous"' + m.group(2)
        
        modified = re.sub(pattern, replacer, modified)

    if modified != content:
        with open(path, 'w') as f:
            f.write(modified)
        updated += 1

print(f'SRI hashes added to {updated} files')
