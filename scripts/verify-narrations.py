"""Finalize only a complete corpus with exact text, valid timing and audio hashes."""
import hashlib,json,pathlib,subprocess
root=pathlib.Path(__file__).resolve().parents[1]
temp=pathlib.Path('/tmp/qc-narration-model')
catalog=json.loads((temp/'catalog.json').read_text())
entries={}
missing=[]
total=0
for item in catalog:
 file=temp/'completed'/f'{item["key"]}.json'
 if not file.exists():missing.append(item['key']);continue
 info=json.loads(file.read_text())
 assert info['text']==item['text'],item['key']
 audio=root/'public'/info['url'].lstrip('/')
 assert hashlib.sha256(audio.read_bytes()).hexdigest()==info['sha256'],item['key']
 assert len(info['sentences'])==len(item['sentences'])
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(audio)]))
 assert abs(duration-info['duration'])<.25,(item['key'],duration,info['duration'])
 previous=0
 for i,mark in enumerate(info['sentences']):
  assert mark['sentence']==i and mark['start']>=previous and mark['end']>mark['start'] and mark['end']<=duration
  previous=mark['end']
 entries[item['key']]=info
 total+=duration
if missing:raise SystemExit(f'Missing {len(missing)} recordings: {missing[:10]}')
manifest={'version':1,'voice':'Kokoro · Siwis','engine':'Kokoro-82M v1.0','entries':entries}
(root/'public/audio/narration/fr-v1/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
print(json.dumps({'recordings':len(entries),'minutes':round(total/60,1),'status':'complete'},ensure_ascii=False))
