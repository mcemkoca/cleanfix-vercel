#!/usr/bin/env python3
"""
CleanFix CSS Refactor Script
"""
import re, glob, os

BASE = "/root/.openclaw/workspace/cleanfix-vercel"
os.chdir(BASE)

LAYOUT_SELECTORS = {
    '.dashboard', '.sidebar', '.sidebar-header', '.sidebar-logo', '.sidebar-nav',
    '.nav-group', '.nav-group-header', '.nav-item', '.nav-icon', '.nav-label',
    '.main-content', '.header', '.hamburger', '.content', '.header-left',
    '.header-right', '.page-title', '.lang-switcher', '.header-btn'
}

# color: white / #fff → var(--text-primary)
COLOR_PATTERNS = [
    (r'color:\s*white\b', 'color: var(--text-primary)'),
    (r'color:\s*#fff\b', 'color: var(--text-primary)'),
    (r'color:#fff\b', 'color:var(--text-primary)'),
    (r'color:white\b', 'color:var(--text-primary)'),
]

# Inline style="" px → CSS variable mappings
PX_MAPPINGS = [
    ('font-size', '12px', 'var(--text-xs)'),
    ('font-size', '14px', 'var(--text-sm)'),
    ('font-size', '16px', 'var(--text-base)'),
    ('font-size', '18px', 'var(--text-lg)'),
    ('font-size', '20px', 'var(--text-xl)'),
    ('font-size', '24px', 'var(--text-2xl)'),
    ('padding', '20px', 'var(--space-5)'),
    ('padding', '16px', 'var(--space-4)'),
    ('padding', '24px', 'var(--space-6)'),
    ('padding', '32px', 'var(--space-8)'),
    ('padding', '8px', 'var(--space-2)'),
    ('padding', '12px', 'var(--space-3)'),
    ('height', '64px', 'var(--header-height)'),
    ('width', '280px', 'var(--sidebar-width)'),
    ('gap', '12px', 'var(--space-3)'),
    ('gap', '16px', 'var(--space-4)'),
    ('gap', '20px', 'var(--space-5)'),
    ('gap', '24px', 'var(--space-6)'),
    ('gap', '8px', 'var(--space-2)'),
    ('gap', '10px', 'var(--space-3)'),
    ('border-radius', '10px', 'var(--radius-md)'),
    ('border-radius', '16px', 'var(--radius-lg)'),
    ('border-radius', '24px', 'var(--radius-xl)'),
    ('border-radius', '6px', 'var(--radius-sm)'),
]


def fix_color(text):
    for pat, repl in COLOR_PATTERNS:
        text = re.sub(pat, repl, text, flags=re.IGNORECASE)
    return text


def fix_inline_styles(html):
    """Replace px values in style=\"...\" attributes."""
    def repl(m):
        style = m.group(1)
        decls = [d.strip() for d in style.split(';') if d.strip()]
        out = []
        for d in decls:
            if ':' in d:
                prop, val = d.split(':', 1)
                prop = prop.strip()
                val = val.strip()
                for map_prop, old_val, new_val in PX_MAPPINGS:
                    if prop == map_prop and val == old_val:
                        val = new_val
                        break
                # compound values (padding: 20px 24px)
                if prop in ('padding', 'margin', 'gap'):
                    parts = val.split()
                    nparts = []
                    for p in parts:
                        for map_prop, old_val, new_val in PX_MAPPINGS:
                            if map_prop == prop and p == old_val:
                                p = new_val
                                break
                        nparts.append(p)
                    val = ' '.join(nparts)
                out.append(f"{prop}:{val}")
            else:
                out.append(d)
        return f'style="{"; ".join(out)}"'
    return re.sub(r'style="([^"]*)"', repl, html)


def is_layout_selector(sel):
    sel = sel.strip()
    for ls in LAYOUT_SELECTORS:
        if sel.startswith(ls) or sel.startswith(ls + ' ') or sel.startswith(ls + ':'):
            return True
    for part in sel.split(','):
        part = part.strip()
        for ls in LAYOUT_SELECTORS:
            if part.startswith(ls) or part.startswith(ls + ' ') or part.startswith(ls + ':'):
                return True
    return False


def remove_layout_rules(css_text):
    """Remove layout/sidebar CSS rules from inline <style> blocks."""
    def parse(text):
        rules = []
        i = 0
        n = len(text)
        while i < n:
            while i < n and text[i] in ' \t\n\r':
                i += 1
            if i >= n:
                break
            if text[i:i+6] == '@media':
                j = text.find('{', i)
                if j == -1:
                    break
                media_sel = text[i:j].strip()
                depth = 1
                k = j + 1
                while k < n and depth > 0:
                    if text[k] == '{':
                        depth += 1
                    elif text[k] == '}':
                        depth -= 1
                    k += 1
                media_body = text[j+1:k-1]
                inner = parse(media_body)
                kept = [(s, b) for s, b in inner if not is_layout_selector(s)]
                if kept:
                    inner_css = ''.join(s + '{' + b + '}' for s, b in kept)
                    rules.append(('__media__', media_sel + '{' + inner_css + '}'))
                i = k
            else:
                j = text.find('{', i)
                if j == -1:
                    break
                selector = text[i:j].strip()
                depth = 1
                k = j + 1
                while k < n and depth > 0:
                    if text[k] == '{':
                        depth += 1
                    elif text[k] == '}':
                        depth -= 1
                    k += 1
                body = text[j+1:k-1]
                if not is_layout_selector(selector):
                    rules.append((selector, body))
                i = k
        return rules

    parsed = parse(css_text)
    out = []
    for sel, body in parsed:
        if sel == '__media__':
            out.append(body)
        else:
            out.append(sel + '{' + body + '}')
    return '\n'.join(out)


def process_company(fp):
    with open(fp, 'r', encoding='utf-8') as f:
        html = f.read()
    orig = html

    # 1. color fix
    html = fix_color(html)
    # 2. inline style px fix
    html = fix_inline_styles(html)
    # 3. add dashboard.css link after </style> or before </head>
    if 'dashboard.css' not in html:
        pos = html.find('</style>')
        if pos != -1:
            ins = pos + len('</style>')
            html = html[:ins] + '\n<link rel="stylesheet" href="css/dashboard.css">' + html[ins:]
        else:
            pos = html.find('</head>')
            if pos != -1:
                html = html[:pos] + '<link rel="stylesheet" href="css/dashboard.css">\n' + html[pos:]
    # 4. remove layout rules from <style> block
    m = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
    if m:
        css = m.group(1)
        cleaned = remove_layout_rules(css)
        if cleaned != css:
            html = html[:m.start()] + '<style>\n' + cleaned + '\n</style>' + html[m.end():]

    if html != orig:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False


def process_dashboard(fp):
    with open(fp, 'r', encoding='utf-8') as f:
        html = f.read()
    orig = html
    html = fix_color(html)
    html = fix_inline_styles(html)
    if 'dashboard.css' not in html:
        pos = html.find('css/components.css">')
        if pos != -1:
            ins = pos + len('css/components.css">')
            html = html[:ins] + '\n<link rel="stylesheet" href="css/dashboard.css">' + html[ins:]
        else:
            pos = html.find('</head>')
            if pos != -1:
                html = html[:pos] + '<link rel="stylesheet" href="css/dashboard.css">\n' + html[pos:]
    if html != orig:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False


def process_index(fp):
    with open(fp, 'r', encoding='utf-8') as f:
        html = f.read()
    orig = html
    html = fix_color(html)
    html = fix_inline_styles(html)
    if 'components.css' not in html:
        pos = html.find('css/main.css">')
        if pos != -1:
            ins = pos + len('css/main.css">')
            html = html[:ins] + '\n<link rel="stylesheet" href="css/components.css">' + html[ins:]
    if html != orig:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False


def process_generic(fp):
    with open(fp, 'r', encoding='utf-8') as f:
        html = f.read()
    orig = html
    html = fix_color(html)
    html = fix_inline_styles(html)
    if html != orig:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False


if __name__ == '__main__':
    changed = []
    for fp in sorted(glob.glob('company-*.html')):
        if process_company(fp):
            changed.append(fp)
    if process_dashboard('dashboard.html'):
        changed.append('dashboard.html')
    if process_index('index.html'):
        changed.append('index.html')
    for fp in sorted(glob.glob('*.html')):
        if fp in changed:
            continue
        if process_generic(fp):
            changed.append(fp)
    print(f"Changed {len(changed)} files")
    for f in changed:
        print(f"  - {f}")
