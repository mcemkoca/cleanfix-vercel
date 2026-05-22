import re, os, glob

BASE = '/root/.openclaw/workspace/cleanfix-vercel'

files = sorted(glob.glob(os.path.join(BASE, '*.html')))
for f in files:
    if os.path.basename(f) == '404.html':
        continue
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    if 'js/validation.js' in content:
        continue
    if '<input' not in content.lower():
        continue
    # Add validation.js near toast.js
    if 'js/toast.js' in content:
        content = content.replace('<script src="js/toast.js"></script>', '<script src="js/toast.js"></script>\n  <script src="js/validation.js"></script>')
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'Added validation.js to {os.path.basename(f)}')
    else:
        print(f'No toast.js in {os.path.basename(f)} — skipped')

print('Done')
