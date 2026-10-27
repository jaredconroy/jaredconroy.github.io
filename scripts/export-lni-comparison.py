"""Repack the original comparison paths without altering either wordmark.

Bounds are in the Illustrator SVG's original viewBox coordinates, measured
from the rendered paths. The source export remains intact for future edits.
"""
from copy import deepcopy
from pathlib import Path
import xml.etree.ElementTree as ET

NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
source = ET.parse('assets-source/design/LNI/LNI-before&after.svg').getroot()
before = (211.005, 195.368, 1627.230, 263.987)
after = (2860.688, 167.845, 1595.034, 328.149)
arrow = (2080.59, 168.37, 500.04, 344.95)
padding, gap, arrow_width = 40, 35, 140
height = max(before[3], after[3]) + 2 * padding
width = before[2] + after[2] + arrow_width + 2 * gap + 2 * padding
root = ET.Element(f'{{{NS}}}svg', {'viewBox': f'0 0 {width:.3f} {height:.3f}', 'fill': '#ffffff'})
root.append(deepcopy(source.find(f'{{{NS}}}defs')))

def positioned(name, bounds, x):
    return ET.SubElement(root, f'{{{NS}}}g', {
        'id': name,
        'transform': f'translate({x - bounds[0]:.3f} {(height - bounds[3])/2 - bounds[1]:.3f})',
    })

original = positioned('before-wordmark', before, padding)
original.append(deepcopy(next(child for child in source if child.tag == f'{{{NS}}}g')))
scale = arrow_width / arrow[2]
arrow_group = ET.SubElement(root, f'{{{NS}}}g', {
    'id': 'comparison-arrow',
    'transform': f'translate({padding + before[2] + gap:.3f} {(height - arrow[3]*scale)/2:.3f}) scale({scale:.6f}) translate({-arrow[0]} {-arrow[1]})',
})
for child in source:
    if child.tag in (f'{{{NS}}}rect', f'{{{NS}}}polygon'):
        arrow_group.append(deepcopy(child))
custom = positioned('after-wordmark', after, padding + before[2] + 2 * gap + arrow_width)
for child in source:
    if child.tag == f'{{{NS}}}path':
        custom.append(deepcopy(child))
ET.ElementTree(root).write('public/media/design/lni-before-after.svg', encoding='UTF-8', xml_declaration=True)
print(f'Comparison viewBox: {width:.3f} × {height:.3f}; arrow width: {arrow_width}')
