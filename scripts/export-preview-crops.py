#!/usr/bin/env python3
"""Trim empty canvas for homepage previews; dedicated galleries keep originals."""
from pathlib import Path
import json
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'public/media'
FILES = [
    'design/lni-lni-stack.webp', 'the-sleds/dirty-hearts.webp', 'design/ctt-logo.webp',
    'design/slimthick-big-logo.webp', 'design/posters-news1.webp', 'design/covers-monkey.webp',
    'design/boots-cats-logo.webp', 'the-sleds/rock-n-roll-romance.webp', 'design/phatboy-brookline-poster.webp',
    'illustration/boone.webp', 'illustration/dog.webp', 'illustration/golfer.webp',
    'illustration/angry.webp', 'illustration/speech.webp', 'illustration/newhopes.webp',
    'foul-balls/poster.webp',
]

records = {}
for relative in FILES:
    source = MEDIA / relative
    image = Image.open(source).convert('RGBA')
    canvas = None
    bounds = (0, 0, image.width, image.height)
    if image.getchannel('A').getextrema()[0] < 255:
        bounds = image.getchannel('A').point(lambda value: 255 if value > 12 else 0).getbbox() or bounds
    else:
        # Only trim a flat canvas when all four corners agree. Painted scenery,
        # photographs, and full-bleed album art retain their original framing.
        corners = [image.getpixel(point) for point in [(0, 0), (image.width-1, 0), (0, image.height-1), (image.width-1, image.height-1)]]
        if all(max(abs(a-b) for a,b in zip(corners[0][:3],corner[:3])) < 15 for corner in corners[1:]):
            canvas = '#%02x%02x%02x' % corners[0][:3]
            rgb = image.convert('RGB')
            difference = ImageChops.difference(rgb, Image.new('RGB', rgb.size, corners[0][:3]))
            bounds = difference.convert('L').point(lambda value: 255 if value > 20 else 0).getbbox() or bounds
    padding = round(max(bounds[2]-bounds[0], bounds[3]-bounds[1]) * .02)
    bounds = (max(0,bounds[0]-padding), max(0,bounds[1]-padding), min(image.width,bounds[2]+padding), min(image.height,bounds[3]+padding))
    image = image.crop(bounds)
    image.thumbnail((1200,1200) if relative.startswith(('illustration/', 'foul-balls/')) else (720,720), Image.Resampling.LANCZOS)
    destination = source.with_name(f'preview-{source.name}')
    if image.getchannel('A').getextrema()[0] == 255:
        image = image.convert('RGB')
    image.save(destination, 'WEBP', quality=87, method=6)
    records[relative] = {'src':destination.relative_to(ROOT / 'public').as_posix(),'width':image.width,'height':image.height}
    if canvas:
        records[relative]['background'] = canvas

(ROOT / 'src/content/preview-assets.json').write_text(json.dumps(records, indent=2) + '\n')
print(f'Exported {len(records)} compact homepage previews; gallery originals untouched.')
