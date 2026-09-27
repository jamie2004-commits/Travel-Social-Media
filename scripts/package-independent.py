"""Package only the authenticated Node app for independent hosting."""
import shutil
import zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
files=['server.cjs','package.json','render.yaml','login.html','login.css','login.js','auth-client.js','index.html','prototype.css','prototype-map.js','prototype-trip.js','prototype-itinerary.js','prototype-photos.js','prototype-social.js','prototype-travel.js','prototype-backup.js','prototype.js','manifest.webmanifest','app-icon.svg','sw.js']
target=root/'independent-release'
target.mkdir(exist_ok=True)
for name in files: shutil.copy2(root/name,target/name)
with zipfile.ZipFile(root/'roam-independent.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for name in files: archive.write(target/name,name)
with zipfile.ZipFile(root/'roam-independent.zip') as archive:
    assert set(archive.namelist())==set(files)
    assert archive.testzip() is None
print('Validated independent-release/ and roam-independent.zip: 20 deployable files, no booking document or hosting credentials.')
