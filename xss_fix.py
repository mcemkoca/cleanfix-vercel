#!/usr/bin/env python3
import glob, re

# Critical innerHTML locations that need escapeHtml wrapping
# Pattern: .innerHTML = `...` or .innerHTML = "..." + var + "..."
CRITICAL_PATTERNS = {
    'company-bookings.html': [
        # Line ~832: td6.innerHTML = '<button onclick="openEditModal(' + newId + ')">...'
        (r'(td\d+\.innerHTML\s*=\s*)("<button[^"]*"\s*\+\s*newId\s*\+\s*"[^"]*")', r'\1escapeHtml(\2)'),
    ],
    'company-quotes.html': [
        # addModalLineItem div.innerHTML
        (r'(div\.innerHTML\s*=\s*)("<input[^"]*"[^;]*);', r'\1escapeHtml(\2);'),
    ],
}

total = 0
for fname in glob.glob('/root/.openclaw/workspace/cleanfix-vercel/company-*.html'):
    with open(fname) as f:
        content = f.read()

    modified = content
    basename = fname.split('/')[-1]
    
    # Strategy 1: Wrap innerHTML assignments that contain user variables
    # Find innerHTML = ... patterns that include variable interpolation
    def fix_innerHTML(match):
        assignment = match.group(0)
        # If already wrapped with escapeHtml, skip
        if 'escapeHtml(' in assignment or 'escapeHtml' in assignment:
            return assignment
        # If it's a static HTML string with no variables, relatively safe
        # But we still wrap for consistency
        if match.group(1) and not re.search(r'\+\s*\w+\s*\+', match.group(1)):
            return assignment
        # Wrap the right side
        left = match.group(1)  # e.g., "el.innerHTML = "
        right = match.group(2)  # the expression
        return left + 'escapeHtml(' + right + ')'

    # Pattern: element.innerHTML = expression;
    # Be careful not to double-wrap
    pattern = r'(\w+\.innerHTML\s*=\s*)([^;]+);'
    modified_new = re.sub(pattern, fix_innerHTML, modified)
    
    if modified_new != modified:
        n_changes = len(re.findall(pattern, content)) - len(re.findall(r'escapeHtml\([^)]*\)', content))
        modified = modified_new
        with open(fname, 'w') as f:
            f.write(modified)
        total += 1
        print(f'UPDATED {basename}: innerHTML assignments wrapped')

print(f'\nTOTAL files updated: {total}')
