"""Accept a short-lived hosting credential through stdin, never files or Git config."""
import getpass,json,os,subprocess,sys
from pathlib import Path
print('Waiting for the temporary source credential on stdin.',flush=True)
credential=json.loads(getpass.getpass('Source credential (hidden): '))
token=credential['token']
env=os.environ.copy()
env.update(GIT_CONFIG_COUNT='1',GIT_CONFIG_KEY_0='http.extraHeader',GIT_CONFIG_VALUE_0='Authorization: Bearer '+token,GIT_TERMINAL_PROMPT='0')
result=subprocess.run(['git','push',credential['remote_url'],'HEAD:'+credential['branch']],cwd=Path(__file__).resolve().parents[1]/'site-source',env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
print(result.stdout.replace(token,'[redacted]'),flush=True)
sys.exit(result.returncode)
