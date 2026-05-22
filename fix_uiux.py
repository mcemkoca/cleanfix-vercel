import re, os, glob

BASE = '/root/.openclaw/workspace/cleanfix-vercel'

EMPTY_STATE_HTML = '''
      <tr class="empty-state-row" style="display:none;">
        <td colspan="99" style="padding:0; border:none;">
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="empty-state-title" data-i18n="empty_title">Henüz kayıt yok</div>
            <div class="empty-state-desc" data-i18n="empty_desc">Bu alanda görüntülenecek veri bulunmuyor.</div>
          </div>
        </td>
      </tr>'''

def remove_inline_toast_css(content):
    """Remove inline toast CSS blocks from <style> sections."""
    # Multi-line patterns with { ... } - need careful handling
    # Remove .toast-container and chained .toast blocks (greedy but bounded)
    content = re.sub(
        r'\.toast-container\s*\{[^{}]*\}(?:\s*\.toast\s*\{[^{}]*\})?(?:\s*\.toast\.error\s*\{[^{}]*\})?(?:\s*\.toast\.success\s*\{[^{}]*\})?(?:\s*\.toast\.info\s*\{[^{}]*\})?',
        '', content, flags=re.DOTALL
    )
    # Remove @keyframes blocks (may contain multiple lines but no nested braces)
    content = re.sub(r'@keyframes\s+toastIn\s*\{[^}]*\}\s*', '', content, flags=re.DOTALL)
    content = re.sub(r'@keyframes\s+toastOut\s*\{[^}]*\}\s*', '', content, flags=re.DOTALL)
    content = re.sub(r'\.toast\.out\s*\{[^}]*\}\s*', '', content, flags=re.DOTALL)
    # Remove standalone .toast{...} blocks that might remain
    content = re.sub(r'\.toast\s*\{[^}]*\}\s*', '', content, flags=re.DOTALL)
    # Clean up extra blank lines in <style>
    content = re.sub(r'(\n\s*){3,}', '\n\n', content)
    return content

def remove_showtoast_definitions(content):
    """Remove inline showToast function definitions using brace balancing."""
    pattern = re.compile(r'function\s+showToast\s*\([^)]*\)\s*\{')
    result = content
    matches = list(pattern.finditer(result))
    for match in reversed(matches):
        start = match.start()
        # find opening brace
        brace_start = result.find('{', match.end() - 1)
        if brace_start == -1:
            continue
        depth = 1
        i = brace_start + 1
        while i < len(result) and depth > 0:
            # skip string literals to avoid counting braces inside strings
            if result[i] in '"\'':
                quote = result[i]
                i += 1
                while i < len(result) and result[i] != quote:
                    if result[i] == '\\':
                        i += 1
                    i += 1
                i += 1
                continue
            if result[i] == '{':
                depth += 1
            elif result[i] == '}':
                depth -= 1
            i += 1
        end = i
        while end < len(result) and result[end] in ' \t;\n':
            end += 1
        result = result[:start] + result[end:]
    return result

def add_script_refs(content, needs_validation=False):
    """Add script refs for toast.js and validation.js."""
    has_toast = 'js/toast.js' in content
    has_validation = 'js/validation.js' in content
    
    if has_toast and (not needs_validation or has_validation):
        return content
    
    scripts_to_add = []
    if not has_toast:
        scripts_to_add.append('<script src="js/toast.js"></script>')
    if needs_validation and not has_validation:
        scripts_to_add.append('<script src="js/validation.js"></script>')
    
    # Insert before </body>
    body_close = content.rfind('</body>')
    if body_close != -1:
        insert = '\n  ' + '\n  '.join(scripts_to_add) + '\n'
        content = content[:body_close] + insert + content[body_close:]
        return content
    
    # Fallback
    html_close = content.rfind('</html>')
    if html_close != -1:
        insert = '\n  ' + '\n  '.join(scripts_to_add) + '\n'
        content = content[:html_close] + insert + content[html_close:]
    return content

def update_toast_calls(content):
    """Update showToast calls that are missing a type parameter."""
    # Match showToast( 'message' ) or showToast( "message" ) — single string arg, no comma after
    pattern = re.compile(r"showToast\s*\(\s*('[^']*'|\"[^\"]*\")\s*\)")
    
    def replacer(m):
        msg = m.group(1)
        msg_lower = msg.lower()
        if any(w in msg_lower for w in ['hata', 'error', 'failed', 'başarısız', 'yanlış', 'invalid']):
            return f"showToast({msg}, 'error')"
        elif any(w in msg_lower for w in ['başarılı', 'success', 'saved', 'kaydedildi', 'tamamlandı', 'created', 'gönderildi', 'alındı', 'oluşturuldu', 'yüklendi', 'hoş geldiniz']):
            return f"showToast({msg}, 'success')"
        elif any(w in msg_lower for w in ['uyarı', 'warning', 'dikkat', 'attention']):
            return f"showToast({msg}, 'warning')"
        else:
            return f"showToast({msg}, 'info')"
    
    content = pattern.sub(replacer, content)
    return content

def add_empty_states_to_tables(content, filename):
    """Add empty state rows to tables in key files."""
    key_pages = [
        'customer-portal.html', 'dashboard.html',
        'company-quotes.html', 'company-maintenance.html', 'company-staff.html',
        'company-bookings.html', 'company-equipment.html', 'company-customers.html',
        'company-services.html', 'company-stock.html', 'company-sectors.html',
        'company-tools.html', 'company-invoices.html', 'company-quality.html',
        'company-reviews.html', 'company-expenses.html', 'company-analytics.html',
        'company.html', 'customers.html', 'invoices.html', 'bookings.html',
        'services.html', 'staff.html', 'reports.html', 'products.html', 'support.html',
        'employee.html', 'pricing.html'
    ]
    if os.path.basename(filename) not in key_pages:
        return content
    
    if 'empty-state-row' in content:
        return content
    
    def tbody_replacer(m):
        return m.group(0) + EMPTY_STATE_HTML
    
    content = re.sub(r'(<tbody[^>]*>)', tbody_replacer, content, count=3)
    return content

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    has_form = '<form' in content.lower()
    
    # 1. Remove inline toast CSS
    content = remove_inline_toast_css(content)
    
    # 2. Remove inline showToast definitions
    content = remove_showtoast_definitions(content)
    
    # 3. Update toast calls without type
    content = update_toast_calls(content)
    
    # 4. Add script refs
    content = add_script_refs(content, needs_validation=has_form)
    
    # 5. Add empty states to tables
    content = add_empty_states_to_tables(content, filepath)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Process all HTML files
files = sorted(glob.glob(os.path.join(BASE, '*.html')))
modified = []
for f in files:
    if process_file(f):
        modified.append(os.path.basename(f))
        print(f'MODIFIED: {os.path.basename(f)}')
    else:
        print(f'skipped: {os.path.basename(f)}')

print(f'\n=== Done ===')
print(f'Modified {len(modified)} files:')
for m in modified:
    print(f'  - {m}')
