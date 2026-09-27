"""Stage only the app's deployable files; never include original booking documents."""
import shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1]
files=['index.html','prototype.css','prototype-map.js','prototype-trip.js','prototype-itinerary.js','prototype-photos.js','prototype-social.js','prototype-travel.js','prototype-backup.js','prototype.js','manifest.webmanifest','app-icon.svg','sw.js']
site=root/'site-source'
(site/'dist').mkdir(parents=True,exist_ok=True)
(site/'.openai').mkdir(exist_ok=True)
for name in files: shutil.copy2(root/name,site/'dist'/name)
shutil.copy2(root/'.openai/hosting.json',site/'.openai/hosting.json')
print('Staged 13 app files and hosting configuration; original itinerary and booking credentials excluded.')
