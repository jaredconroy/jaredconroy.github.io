"""Exercise future shared artwork imports without touching the real library."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from PIL import Image

IMPORTER = Path(__file__).resolve().parents[1] / 'scripts/import-illustrations.py'


class IllustrationImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'scripts').mkdir()
        shutil.copy2(IMPORTER, self.root / 'scripts/import-illustrations.py')
        (self.root / 'src/content').mkdir(parents=True)
        (self.root / 'src/content/illustration-details.json').write_text('{}')

    def run_import(self):
        subprocess.run([sys.executable, str(self.root / 'scripts/import-illustrations.py')], check=True, capture_output=True)
        return json.loads((self.root / 'src/content/illustration-assets.json').read_text())

    def image(self, name, color):
        file = self.root / 'assets-source' / name
        file.parent.mkdir(parents=True, exist_ok=True)
        Image.new('RGBA', (80, 120), color).save(file)

    def test_future_foul_balls_image_joins_shared_gallery_with_brand_backing(self):
        self.image('illustration/sketch.png', (255, 255, 255, 255))
        self.run_import()
        self.image('foul-balls/characters/new-character.PNG', (80, 30, 120, 128))
        records = self.run_import()
        self.assertEqual(len(records), 2)
        future = records[1]
        self.assertEqual(future['collection'], 'foul-balls')
        self.assertEqual(future['id'], 'foul-balls-characters-new-character')
        self.assertTrue(future['transparent'])
        self.assertEqual(future['background'], '#dcc1a2')
        for key in ('src', 'small'):
            self.assertTrue((self.root / 'public' / future[key]).is_file())
        public = json.loads((self.root / 'public/media/illustration/gallery.json').read_text())
        self.assertNotIn('sourceHash', public[1])
        self.assertEqual(public[1]['id'], future['id'])

    def test_metadata_updates_without_reencoding_unchanged_image(self):
        self.image('illustration/sketch.png', (255, 255, 255, 255))
        initial = self.run_import()[0]
        output = self.root / 'public' / initial['src']
        timestamp = output.stat().st_mtime_ns
        (self.root / 'src/content/illustration-details.json').write_text(json.dumps({
            'illustration/sketch.png': {'title': 'Named Drawing', 'background': '#88281d', 'alt': 'Custom alt text.'}
        }))
        updated = self.run_import()[0]
        self.assertEqual(updated['title'], 'Named Drawing')
        self.assertEqual(updated['background'], '#88281d')
        self.assertEqual(updated['alt'], 'Custom alt text.')
        self.assertEqual(output.stat().st_mtime_ns, timestamp)

    def test_checkout_without_masters_preserves_committed_gallery(self):
        self.image('illustration/sketch.png', (255, 255, 255, 255))
        initial = self.run_import()
        shutil.rmtree(self.root / 'assets-source')
        self.assertEqual(self.run_import(), initial)


if __name__ == '__main__':
    unittest.main()
