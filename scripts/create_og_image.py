from PIL import Image, ImageDraw, ImageFont
import os

img = Image.new('RGB', (1200, 630), color=(11, 18, 35))
draw = ImageDraw.Draw(img)

# Dark gradient background
for y in range(630):
    r = int(11 + (20-11)*y/630)
    g = int(18 + (35-18)*y/630)
    b = int(35 + (50-35)*y/630)
    draw.line([(0,y),(1200,y)], fill=(r,g,b))

# Decorative orbs (simulated with ellipses)
# Teal orb
draw.ellipse([750, -50, 1150, 350], fill=(20, 184, 166))
# Purple orb
draw.ellipse([650, 150, 1050, 550], fill=(139, 92, 246))
# Re-draw gradient on top to blend orbs
for y in range(630):
    alpha = 0.88
    r = int(11 + (20-11)*y/630)
    g = int(18 + (35-18)*y/630)
    b = int(35 + (50-35)*y/630)
    # We can't do real alpha blending with line, so just draw subtle tinted overlay
    draw.line([(0,y),(1200,y)], fill=(r,g,b))

# Try load fonts
try:
    font_logo = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 80)
    font_tag = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 40)
    font_body = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 28)
except Exception:
    font_logo = ImageFont.load_default()
    font_tag = ImageFont.load_default()
    font_body = ImageFont.load_default()

# Logo accent bar
draw.rounded_rectangle([80, 180, 140, 186], radius=3, fill=(20, 184, 166))

# Main text
draw.text((80, 200), 'CleanFix', fill=(255,255,255), font=font_logo)
draw.text((80, 320), 'KOBİ Yönetim Platformu', fill=(200,210,230), font=font_tag)
draw.text((80, 400), 'Temizlik • İnşaat • Berber • Market • Restoran • Marangoz • Elektrik', fill=(148,163,184), font=font_body)

# CTA badge
draw.rounded_rectangle([80, 500, 320, 560], radius=8, fill=(20, 184, 166))
draw.text((105, 515), 'cleanfix.app', fill=(255,255,255), font=font_body)

out_path = '/root/.openclaw/workspace/cleanfix-vercel/assets/og-image.png'
img.save(out_path)
print('Created:', out_path, os.path.getsize(out_path), 'bytes')
