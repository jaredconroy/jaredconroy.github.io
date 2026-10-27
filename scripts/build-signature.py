"""Rebuild the brush SVG from the preserved handwriting centerlines with a smooth, fixed-angle nib."""
from pathlib import Path
import xml.etree.ElementTree as ET
import re, math, json
from shapely.geometry import LineString
from shapely.affinity import affine_transform
asset=Path('public/media/jared-signature.svg')
original=Path('public/media/jared-signature-source.svg')
if not original.exists():original.write_text(asset.read_text())
root=ET.fromstring(original.read_text()); paths=[e for e in root if e.tag.endswith('path')]
brush=json.loads(Path('src/content/signature-brush.json').read_text())
svg=ET.Element('svg',{'xmlns':'http://www.w3.org/2000/svg','viewBox':' '.join(map(str,brush['viewBox'])),'preserveAspectRatio':'xMinYMin meet'})
defs=ET.SubElement(svg,'defs')
outlines=[]
strokes=[]
for index,path in enumerate(paths,1):
 tokens=re.findall(r'[MC]|[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?',path.attrib['d'])
 transform=[float(n) for n in re.findall(r'[-+]?(?:\d*\.)?\d+',path.attrib['transform'])]
 a,b,c,d,tx,ty=transform
 def screen(p):return (a*p[0]+c*p[1]+tx,b*p[0]+d*p[1]+ty)
 i=0; points=[]; current=(0,0)
 while i<len(tokens):
  cmd=tokens[i];i+=1
  if cmd=='M':current=(float(tokens[i]),float(tokens[i+1]));i+=2;points.append(screen(current))
  elif cmd=='C':
   values=list(map(float,tokens[i:i+6]));i+=6
   p0=current;p1=tuple(values[:2]);p2=tuple(values[2:4]);p3=tuple(values[4:])
   for step in range(1,37):
    t=step/36;u=1-t
    points.append(screen(tuple(u*u*u*p0[k]+3*u*u*t*p1[k]+3*u*t*t*p2[k]+t*t*t*p3[k] for k in [0,1])))
   current=p3
  else:raise ValueError(cmd)
 # Sweep an elliptical nib along the original curve. A geometric union avoids
 # folded offset edges at the a, r, and d's tight changes of direction.
 angle=math.radians(brush['angle']); co=math.cos(angle); si=math.sin(angle)
 major,minor=brush['major'],brush['minor']
 normalized=[((co*x+si*y)/major,(-si*x+co*y)/minor) for x,y in points]
 swept=LineString(normalized).buffer(1,quad_segs=12)
 ink=affine_transform(swept,[major*co,-minor*si,major*si,minor*co,0,0]).simplify(.035,preserve_topology=True)
 def ring(coords):
  return 'M'+'L'.join(f'{x:.2f},{y:.2f}' for x,y in coords)+'Z'
 outline=ring(ink.exterior.coords)+''.join(ring(hole.coords) for hole in ink.interiors)
 outlines.append(outline)
 # A single playback loop sweeps the same elliptical nib along these two
 # original centerlines. No CSS fragment animations or reveal masks.
 line=LineString(points)
 count=math.ceil(line.length/.35)
 samples=[line.interpolate(i/count,normalized=True) for i in range(count+1)]
 strokes.append({'start':0 if index==1 else 1100,'duration':1100 if index==1 else 4000,
                 'points':[[round(p.x,3),round(p.y,3)] for p in samples]})
group=ET.SubElement(svg,'g')
for outline in outlines:
 ET.SubElement(group,'path',{'class':'signature-ink','fill':'currentColor','d':outline})
Path('src/content/signature-strokes.json').write_text(json.dumps(strokes,separators=(',',':')))
Path('src/content/signature-brush.json').write_text(json.dumps(brush,separators=(',',':'))+'\n')
Path('public/media/signature-brush.json').write_text(json.dumps(brush,separators=(',',':'))+'\n')
ET.ElementTree(svg).write(asset,encoding='unicode')
print('Brush SVG:',asset.stat().st_size,'bytes; two static vector strokes and two centerline playback records.')
