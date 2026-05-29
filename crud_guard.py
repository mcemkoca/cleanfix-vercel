#!/usr/bin/env python3
"""Add AUTH.requireRoleForAction guards to CRUD functions in CleanFix company-*.html files."""
import re, glob, sys

# File -> (function_name, action_name, allowed_roles)
RULES = {
    'company-bookings.html': [
        ('saveEdit', 'saveEdit', ['admin','company']),
        ('addBooking', 'addBooking', ['admin','company']),
    ],
    'company-customers.html': [
        ('saveEdit', 'saveEdit', ['admin','company']),
        ('addCustomer', 'addCustomer', ['admin','company']),
    ],
    'company-equipment.html': [
        ('saveEquip', 'saveEquip', ['admin','company']),
    ],
    'company-invoices.html': [
        ('saveEdit', 'saveEdit', ['admin','company']),
        ('addInvoice', 'addInvoice', ['admin','company']),
    ],
    'company-maintenance.html': [
        ('saveNewTask', 'saveNewTask', ['admin','company']),
    ],
    'company-quotes.html': [
        ('addModalLineItem', 'addModalLineItem', ['admin','company']),
        ('saveQuote', 'saveQuote', ['admin','company']),
    ],
    'company-sectors.html': [
        ('addSector', 'addSector', ['admin','company']),
    ],
    'company-services.html': [
        ('saveEdit', 'saveEdit', ['admin','company']),
        ('addService', 'addService', ['admin','company']),
    ],
    'company-staff.html': [
        ('saveEdit', 'saveEdit', ['admin','company']),
        ('addStaff', 'addStaff', ['admin','company']),
    ],
    'company-stock.html': [
        ('saveEdit', 'saveEdit', ['admin','company']),
        ('addProduct', 'addProduct', ['admin','company']),
    ],
}

# Also search for delete functions dynamically
delete_patterns = ['deleteBooking', 'deleteCustomer', 'deleteEquip', 'deleteInvoice', 
                   'deleteTask', 'deleteQuote', 'deleteSectorCard', 'deleteService', 
                   'deleteStaff', 'deleteProduct']

total = 0
for fname, rules in RULES.items():
    path = f'/root/.openclaw/workspace/cleanfix-vercel/{fname}'
    try:
        with open(path, 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print(f'SKIP: {fname} not found')
        continue

    modified = content
    count = 0

    for func_name, action_name, roles in rules:
        # Pattern: function name(...){ or function name(){  or function name(){
        pattern = r'(function\s+' + re.escape(func_name) + r'\s*\([^)]*\)\s*\{)'
        guard = f"if (!AUTH.requireRoleForAction({roles!r}, '{action_name}')) return; "
        
        def replacer(m, guard=guard):
            return m.group(1) + guard

        new_content, n = re.subn(pattern, replacer, modified, count=1)
        if n > 0:
            modified = new_content
            count += 1
            total += 1

    # Dynamic delete functions
    for dp in delete_patterns:
        if dp in modified:
            pattern = r'(function\s+' + re.escape(dp) + r'\s*\([^)]*\)\s*\{)'
            guard = f"if (!AUTH.requireRoleForAction(['admin','company'], '{dp}')) return; "
            def replacer(m, guard=guard):
                return m.group(1) + guard
            new_content, n = re.subn(pattern, replacer, modified, count=1)
            if n > 0:
                modified = new_content
                count += 1
                total += 1

    if count > 0:
        with open(path, 'w') as f:
            f.write(modified)
        print(f'UPDATED {fname}: {count} functions')
    else:
        print(f'NOCHANGE {fname}')

print(f'\nTOTAL functions updated: {total}')
