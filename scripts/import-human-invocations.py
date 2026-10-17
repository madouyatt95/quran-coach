import json,re,unicodedata,collections,hashlib,pathlib
local=json.load(open('/tmp/qc-narration-model/invocations.json'));remote=json.load(open('/tmp/qc-opendua-catalogue.json'))
def norm(s):
 s=unicodedata.normalize('NFKC',s).replace('ٱ','ا').replace('ـ','')
 return ''.join(c for c in s if unicodedata.category(c).startswith('L'))
index=collections.defaultdict(list)
for e in remote['entries']:
 for v in e.get('variations',[]):
  for s in v.get('steps',[]):
   if s['type']!='recitation' or len(s.get('recordings',[]))!=1:continue
   items=s.get('items',[])
   if len(items)!=1 or 'dua' not in items[0]:continue
   d=items[0]['dua'];r=s['recordings'][0]
   index[norm(d['arabic'])].append({'arabic':d['arabic'],'url':r['url'],'entry':e['id'],'slug':e['slug']})
matches={}
for d in local:
 candidates=index.get(norm(d['arabic']),[])
 if candidates and len(set(c['url'] for c in candidates))==1:matches[d['key']]=candidates[0]
# Explicitly reviewed variants only; fail closed if either source text changes.
reviewed=json.loads((pathlib.Path(__file__).parent/'invocation-audio-reviewed.json').read_text())
for item in reviewed:
 entry=next(e for e in remote['entries'] if e['id']==item['entryId'])
 step=entry['variations'][0]['steps'][0]
 assert len(step['items'])==1 and len(step['recordings'])==1
 source=step['items'][0]['dua']['arabic']
 assert hashlib.sha256(source.encode()).hexdigest()==item['sourceTextSha256']
 for key in item['keys']:
  d=next(d for d in local if d['key']==key)
  assert hashlib.sha256(d['arabic'].encode()).hexdigest()==item['localTextSha256']
  matches[key]={'arabic':source,'url':step['recordings'][0]['url'],'entry':entry['id'],'slug':entry['slug'],'audioNote':item['audioNote']}
json.dump(matches,open('/tmp/qc-opendua-matches.json','w'),ensure_ascii=False,indent=2)
print('matched entries',len(matches),'unique files',len(set(m['url'] for m in matches.values())))
print(collections.Counter(k.split(':')[0] for k in matches).most_common(12))
print('first',matches.get('hisn_chap_1:14'))
# OpenDua's Downloads page explicitly invites apps to ship this archive.
# Audio is NOT CC BY; preserve its separate provenance and attribution.
import pathlib,zipfile,hashlib,subprocess
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'public/audio/invocations/opendua-v0.0.2';out.mkdir(parents=True,exist_ok=True)
archive=zipfile.ZipFile('/tmp/qc-opendua-audio.zip')
metadata=json.loads(archive.read('manifest.json'))
tracks={t['key'].split('/')[-1]:t for t in metadata['tracks']}
recordings={}
for name in sorted({m['url'].split('/')[-1] for m in matches.values()}):
 data=archive.read(name);assert hashlib.sha256(data).hexdigest()==tracks[name]['sha256']
 file=out/name;file.write_bytes(data)
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(file)]))
 # OD-076 has a higher noise floor: -40 dB misses all its breathing pauses.
 noise='-32dB' if name=='OD-076.mp3' else '-40dB'
 scan=subprocess.run(['ffmpeg','-nostdin','-i',str(file),'-af',f'silencedetect=noise={noise}:d=0.45','-f','null','-'],capture_output=True,text=True,check=True).stderr
 boundaries=[0.0];start=None
 for kind,value in re.findall(r'silence_(start|end): ([\d.]+)',scan):
  if kind=='start':start=float(value)
  elif start is not None:
   middle=(start+float(value))/2
   if middle-boundaries[-1]>=2 and duration-middle>=2:boundaries.append(round(middle,4))
   start=None
 boundaries.append(duration)
 recordings[name]={'url':'/audio/invocations/opendua-v0.0.2/'+name,'duration':duration,'ranges':[[a,b] for a,b in zip(boundaries,boundaries[1:])],'sha256':tracks[name]['sha256']}
output={key:{**recordings[value['url'].split('/')[-1]],'sourceArabic':value['arabic'],'arabic':next(d['arabic'] for d in local if d['key']==key),'source':'https://opendua.org/dua/'+value['slug'],'reciter':'Muhammad Jumah',**({'audioNote':value['audioNote']} if value.get('audioNote') else {})} for key,value in matches.items()}
(root/'src/data/invocationHumanAudio.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':')))
out.joinpath('README-source.txt').write_bytes(archive.read('README.txt'))
print('Imported human recordings',len(recordings))
