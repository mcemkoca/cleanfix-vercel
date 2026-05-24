#!/usr/bin/env python3
"""
Add auth.js + CSP to all sector HTML files in cleanfix-vercel/sectors/
"""
import os
import re

CSP_META = '''<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://cdn.example.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self';">
'''

AUTH_SCRIPTS = '''<script src="../../js/auth.js"></script>
<script>checkAuth(['admin','company']);</script>
'''

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already has auth.js
    if 'auth.js' in content:
        return False
    
    # Add CSP meta tag after <head>
    if '<meta http-equiv="Content-Security-Policy"' not in content:
        content = re.sub(r'(<head[^>]*>\n?)', r'\1\t' + CSP_META, content, count=1)
    
    # Add auth scripts after <body>
    content = re.sub(r'(<body[^>]*>\n?)', r'\1\n' + AUTH_SCRIPTS, content, count=1)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

base = '/root/.openclaw/workspace/cleanfix-vercel/sectors'
modified = 0
skipped = 0

for root, dirs, files in os.walk(base):
    for fname in files:
        if not fname.endswith('.html'):
            continue
        path = os.path.join(root, fname)
        rel = os.path.relpath(path, '/root/.openclaw/workspace/cleanfix-vercel')
        depth = rel.count(os.sep)
        
        if process_file(path):
            modified += 1
            print(f"[OK] {rel}")
        else:
            skipped += 1

print(f"\nDone: {modified} modified, {skipped} skipped (already had auth)")
