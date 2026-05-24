#!/usr/bin/env python3
"""
WCAG Contrast Checker — CleanFix CSS
"""
import re, os

def hex_to_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join([c*2 for c in h])
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def relative_luminance(rgb):
    def f(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else pow((c + 0.055) / 1.055, 2.4)
    r, g, b = rgb
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def contrast_ratio(c1, c2):
    l1 = relative_luminance(c1)
    l2 = relative_luminance(c2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

# Read CSS files
css_files = ["css/main.css", "css/components.css"]
all_text = ""
for f in css_files:
    path = os.path.join("/root/.openclaw/workspace/cleanfix-vercel", f)
    if os.path.exists(path):
        with open(path) as fh:
            all_text += fh.read() + "\n"

# Extract CSS custom properties (variables)
vars_found = {}
for m in re.finditer(r'--([\w-]+)\s*:\s*([^;]+)', all_text):
    name = m.group(1)
    val = m.group(2).strip()
    vars_found[name] = val

# Known critical pairs to check
PAIRS = [
    ("text-primary", "bg-primary", "Primary text on primary bg"),
    ("text-secondary", "bg-secondary", "Secondary text on secondary bg"),
    ("text-muted", "bg-surface", "Muted text on surface"),
    ("text-heading", "bg-page", "Heading on page bg"),
    ("text-body", "bg-page", "Body text on page bg"),
    ("primary", "bg-page", "Primary color on page bg (buttons/links)"),
    ("text-on-primary", "primary", "Text on primary buttons"),
    ("text-on-dark", "bg-dark", "Text on dark bg"),
]

print("=" * 70)
print("WCAG CONTRAST ANALYSIS — CleanFix")
print("=" * 70)

def resolve(val):
    val = val.strip()
    if val.startswith('#') and len(val) in (4,7):
        return hex_to_rgb(val)
    if val.startswith('rgb('):
        nums = re.findall(r'\d+', val)
        if len(nums) >= 3:
            return tuple(int(n) for n in nums[:3])
    if val.startswith('var(--'):
        inner = val[4:].strip(')').strip()
        # Try resolve recursively
        if inner in vars_found:
            return resolve(vars_found[inner])
    # Try direct hex or named color
    if val in vars_found:
        return resolve(vars_found[val])
    if val.startswith('#'):
        return hex_to_rgb(val)
    # Named fallback
    named = {
        'white': (255,255,255), 'black': (0,0,0),
        'red': (255,0,0), 'green': (0,128,0), 'blue': (0,0,255),
        'teal': (0,128,128), 'gray': (128,128,128),
    }
    if val.lower() in named:
        return named[val.lower()]
    return None

results = []
for fg_name, bg_name, label in PAIRS:
    fg = resolve(vars_found.get(fg_name, '#000'))
    bg = resolve(vars_found.get(bg_name, '#fff'))
    if fg is None or bg is None:
        results.append((label, fg_name, bg_name, None, "COULD NOT RESOLVE"))
        continue
    ratio = contrast_ratio(fg, bg)
    aa = "PASS" if ratio >= 4.5 else "FAIL"
    aaa = "PASS" if ratio >= 7 else "FAIL"
    results.append((label, fg_name, bg_name, ratio, aa, aaa))

# Print table
print(f"{'Pair':<45} {'Ratio':<8} {'AA':<6} {'AAA':<6}")
print("-" * 70)
for row in results:
    if len(row) == 5:
        label, fg, bg, ratio, status = row
        print(f"{label:<45} {str(ratio):<8} {status:<6}")
    else:
        label, fg, bg, ratio, aa, aaa = row
        print(f"{label:<45} {ratio:.2f}:1  {aa:<6} {aaa:<6}")

# Also scan direct color usage for body/text
print("\n" + "-" * 70)
print("DIRECT CSS COLOR USAGE (sample)")
print("-" * 70)
body_bg = re.search(r'body\s*\{[^}]*background[^:]*:\s*([^;}]+)', all_text, re.S)
body_fg = re.search(r'body\s*\{[^}]*color[^:]*:\s*([^;}]+)', all_text, re.S)
if body_bg and body_fg:
    bg = resolve(body_bg.group(1))
    fg = resolve(body_fg.group(1))
    if bg and fg:
        ratio = contrast_ratio(fg, bg)
        print(f"body text on body bg: {ratio:.2f}:1 (AA: {'PASS' if ratio>=4.5 else 'FAIL'}, AAA: {'PASS' if ratio>=7 else 'FAIL'})")

# Find any low-contrast pairs manually declared
low_contrast = []
for m in re.finditer(r'\.(\w+)\s*\{[^}]*color\s*:\s*([^;}]+)[^}]*background(?:-color)?\s*:\s*([^;}]+)', all_text, re.S):
    cls, fg_val, bg_val = m.group(1), m.group(2).strip(), m.group(3).strip()
    fg = resolve(fg_val)
    bg = resolve(bg_val)
    if fg and bg:
        ratio = contrast_ratio(fg, bg)
        if ratio < 4.5:
            low_contrast.append((cls, ratio, fg_val, bg_val))

if low_contrast:
    print(f"\nWARN: {len(low_contrast)} classes with AA contrast < 4.5 found:")
    for cls, ratio, fg, bg in low_contrast[:10]:
        print(f"  .{cls}: {ratio:.2f}:1 (fg={fg}, bg={bg})")
else:
    print("\nNo critically low contrast classes found in direct declarations.")

print("\n" + "=" * 70)
print("CONTRAST CHECK COMPLETE")
print("=" * 70)
