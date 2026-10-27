#!/usr/bin/env python3
"""Export local Illustration/Foul Balls image assets to a shared static gallery.

Raw masters stay local. A checkout without masters uses the committed manifest
and optimized exports, so GitHub Pages builds need neither Python nor Pillow.
"""
from pathlib import Path
import hashlib
import json
import re
import shutil
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'src/content/illustration-assets.json'
DETAILS = ROOT / 'src/content/illustration-details.json'
EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'}

def write_changed(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists() or path.read_text() != content:
        path.write_text(content)

def main():
    sources = []
    for collection in ('illustration', 'foul-balls'):
        folder = ROOT / 'assets-source' / collection
        sources.extend((collection, path) for path in sorted(folder.rglob('*'))
                       if path.is_file() and path.suffix.lower() in EXTENSIONS)
    if not sources:
        print('Illustrations: using committed optimized assets (no local masters).')
        return
    from PIL import Image, ImageOps
    details = json.loads(DETAILS.read_text())
    previous = {item['source']: item for item in json.loads(MANIFEST.read_text())} if MANIFEST.exists() else {}
    records = []
    for collection, source in sources:
        relative = source.relative_to(ROOT / 'assets-source').as_posix()
        info = details.get(relative, {})
        slug = re.sub(r'[^a-z0-9]+', '-', source.relative_to(ROOT / 'assets-source' / collection).with_suffix('').as_posix().lower()).strip('-')
        ident = f'{collection}-{slug}'
        directory = Path('media/illustration') if collection == 'illustration' else Path('media/foul-balls/artwork')
        vector = source.suffix.lower() == '.svg'
        full = directory / f'{slug}{".svg" if vector else ".webp"}'
        if relative == 'foul-balls/poster.png':
            full = Path('media/foul-balls/poster.webp')
        small = full if vector else directory / f'{slug}-small.webp'
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        old = previous.get(relative, {})
        refresh = old.get('sourceHash') != digest or not (ROOT / 'public' / full).exists() or not (ROOT / 'public' / small).exists()
        if vector:
            svg = ET.parse(source).getroot()
            viewbox = svg.attrib.get('viewBox', '').replace(',', ' ').split()
            width, height = (float(viewbox[2]), float(viewbox[3])) if len(viewbox) == 4 else (1000, 1000)
            transparent = True
            if refresh:
                (ROOT / 'public' / full).parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, ROOT / 'public' / full)
        else:
            with Image.open(source) as original:
                image = ImageOps.exif_transpose(original).convert('RGBA')
                width, height = image.size
                transparent = image.getchannel('A').getextrema()[0] < 255
                if refresh:
                    for target, limit, quality in ((full, 2200, 91), (small, 760, 87)):
                        export = image.copy()
                        export.thumbnail((limit, limit), Image.Resampling.LANCZOS)
                        if not transparent:
                            export = export.convert('RGB')
                        destination = ROOT / 'public' / target
                        destination.parent.mkdir(parents=True, exist_ok=True)
                        export.save(destination, 'WEBP', quality=quality, method=6)
        title = info.get('title', source.stem.replace('-', ' ').replace('_', ' ').title())
        records.append({
            'id': ident, 'source': relative, 'sourceHash': digest,
            'collection': collection, 'title': title,
            'alt': info.get('alt', f'{title}, an illustration by Jared Conroy.'),
            'caption': info.get('caption', 'Illustration by Jared Conroy.'),
            'background': info.get('background', '#dcc1a2' if collection == 'foul-balls' else '#edf5fb'),
            'order': info.get('order', 100), 'width': int(width), 'height': int(height),
            'transparent': transparent, 'src': full.as_posix(), 'small': small.as_posix()
        })
    records.sort(key=lambda item: (item['collection'] != 'illustration', item['order'], item['title']))
    write_changed(MANIFEST, json.dumps(records, indent=2) + '\n')
    # The composition lab consumes the same public asset data as the application.
    public_records = [{key: value for key, value in item.items() if key not in ('source', 'sourceHash')} for item in records]
    write_changed(ROOT / 'public/media/illustration/gallery.json', json.dumps(public_records, indent=2) + '\n')
    print(f'Illustrations: {len(records)} artworks, including {sum(item["collection"] == "foul-balls" for item in records)} Foul Balls artwork(s).')

if __name__ == '__main__':
    main()
