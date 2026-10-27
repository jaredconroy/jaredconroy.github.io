"""Union the licensed Fraunces ampersand contours for a seamless neon outline.

Requires fonttools[woff] and shapely at generation time; no browser dependency.
"""
from pathlib import Path
import json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen
from shapely.geometry import LineString
from shapely.ops import unary_union, polygonize

font=TTFont('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2')
font=instantiateVariableFont(font,{'opsz':112,'wght':850,'SOFT':100,'WONK':1},inplace=True)
glyphs=font.getGlyphSet()

class FlattenPen(BasePen):
    def __init__(self):
        super().__init__(glyphs)
        self.contours=[]
    def _moveTo(self,p):
        self.current=[p]
    def _lineTo(self,p):
        self.current.append(p)
    def _curveToOne(self,p1,p2,p3):
        p0=self.current[-1]
        for i in range(1,65):
            t=i/64;u=1-t
            self.current.append(tuple(u**3*p0[k]+3*u*u*t*p1[k]+3*u*t*t*p2[k]+t**3*p3[k] for k in (0,1)))
    def _qCurveToOne(self,p1,p2):
        p0=self.current[-1]
        for i in range(1,65):
            t=i/64;u=1-t
            self.current.append(tuple(u*u*p0[k]+2*u*t*p1[k]+t*t*p2[k] for k in (0,1)))
    def _closePath(self):
        self.current.append(self.current[0])
        self.contours.append(self.current)
    _endPath=_closePath

glyph=glyphs[font.getBestCmap()[ord('&')]]
pen=FlattenPen();glyph.draw(pen)
# Partition crossings into faces, then retain the nonzero winding fill.
# Subtracting every hole globally would incorrectly cut overlapping strokes.
faces=polygonize(unary_union([LineString(c) for c in pen.contours]))
def winding(x,y):
    total=0
    for contour in pen.contours:
        for (ax,ay),(bx,by) in zip(contour,contour[1:]):
            side=(bx-ax)*(y-ay)-(x-ax)*(by-ay)
            if ay<=y<by and side>0:total+=1
            elif by<=y<ay and side<0:total-=1
    return total
ink=unary_union([face for face in faces if winding(*face.representative_point().coords[0])]).simplify(.12,preserve_topology=True)
assert ink.is_valid and ink.geom_type=='Polygon','Expected a single connected ampersand silhouette'
baseline=(font['head'].unitsPerEm+font['hhea'].ascent+font['hhea'].descent)/2
def ring(coords):
    return 'M'+'L'.join(f'{x:.2f},{baseline-y:.2f}' for x,y in coords)+'Z'
path=ring(ink.exterior.coords)+''.join(ring(hole.coords) for hole in ink.interiors)
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {glyph.width} 2000" aria-hidden="true"><path class="neon-backdrop" d="{path}"/><g class="neon-foreground"><path class="neon-core" d="{path}"/></g></svg>\n'
target=Path('public/media/afroman-ampersand.svg');target.write_text(svg)
Path('src/content/afroman-ampersand.json').write_text(json.dumps({'viewBox':f'0 0 {glyph.width} 2000','path':path},separators=(',',':'))+'\n')
print(f'Merged {len(pen.contours)} font contours into one silhouette with {len(ink.interiors)} natural counters. {target.stat().st_size} bytes.')
