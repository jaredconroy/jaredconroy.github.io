#!/usr/bin/env python3
"""Import a built Afroman-web snapshot without changing its source checkout."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('source',type=Path,help='Afroman-web checkout containing build-web/')
parser.add_argument('--wasm-opt',type=Path,help='Optional Binaryen wasm-opt executable to strip debug data and optimize the imported copy')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
source=args.source.resolve()
build=source/'build-web'
for name in ('afroman.js','afroman.wasm','afroman.data','build-id.txt'):
    if not (build/name).is_file():
        parser.error(f'Missing built game file: {build/name}')
build_id=(build/'build-id.txt').read_text().strip()
if not build_id.isalnum():
    parser.error('Unexpected build identifier')
target=root/'public/games/afroman'
target.mkdir(parents=True,exist_ok=True)
notices=target/'licenses'
notices.mkdir(exist_ok=True)
for license_file in (source/'vendor/cocos2d/licenses').glob('*'):
    if license_file.is_file():
        shutil.copy2(license_file,notices/license_file.name)
for relative,name in [('vendor/libwebp/COPYING','WebP-COPYING'),('vendor/libwebp/PATENTS','WebP-PATENTS'),('vendor/libtiff/LICENSE.md','TIFF-LICENSE.md')]:
    shutil.copy2(source/relative,notices/name)
for name in ('afroman.js','afroman.data'):
    shutil.copy2(build/name,target/name)
if args.wasm_opt:
    subprocess.run([str(args.wasm_opt),str(build/'afroman.wasm'),'--strip-debug','--strip-producers','-O2','-o',str(target/'afroman.wasm')],check=True)
else:
    shutil.copy2(build/'afroman.wasm',target/'afroman.wasm')
(target/'index.html').write_text((root/'scripts/afroman-shell.html').read_text().replace('__AFROMAN_BUILD_ID__',build_id))
media=root/'public/media/afroman'
media.mkdir(parents=True,exist_ok=True)
shutil.copy2(source/'Resources/start2/start0.jpg',media/'title.jpg')
for number in range(1,4):
    shutil.copy2(source/f'Resources/level{number}button.png',media/f'level-{number}.png')
manifest={'source_project':'Afroman-web','source_build':build_id,'optimized_wasm':bool(args.wasm_opt),'files':{name:{'bytes':(target/name).stat().st_size,'sha256':hashlib.sha256((target/name).read_bytes()).hexdigest()} for name in ('afroman.js','afroman.wasm','afroman.data')}}
(target/'build.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Imported Afroman build {build_id}; game payload {sum(f["bytes"] for f in manifest["files"].values())/1024/1024:.1f} MiB')
