#!/usr/bin/env python3
"""Import the QUL 95 JSON download; no machine-generated translations or inferred keys."""
import argparse, hashlib, json, pathlib, zipfile
p=argparse.ArgumentParser();p.add_argument('archive');p.add_argument('--audit-dir',required=True);args=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
with zipfile.ZipFile(args.archive) as z:
    names=[n for n in z.namelist() if n.endswith('.json')]
    assert len(names)==1
    raw=z.read(names[0]);data=json.loads(raw)
expected=set()
for page in range(1,605):
    response=json.loads((pathlib.Path(args.audit_dir)/f'v4-api-{page}.json').read_text())
    for verse in response['verses']:
        expected.update(f"{verse['verse_key']}:{word['position']}" for word in verse['words'] if word['char_type_name']=='word')
assert len(data)==77429 and set(data)==expected, 'Unexpected/missing word references'
assert all(isinstance(v,str) and v.strip() and '<' not in v for v in data.values()), 'Invalid translation value'
out=root/'src/lib/interactiveMushaf/french';out.mkdir(exist_ok=True)
for surah in range(1,115):
    subset={k:v for k,v in data.items() if k.startswith(f'{surah}:')}
    (out/f'{surah}.json').write_text(json.dumps(subset,ensure_ascii=False,separators=(',',':'))+'\n')
print(json.dumps({'source':'https://qul.tarteel.ai/resources/translation/95','sha256':hashlib.sha256(raw).hexdigest(),'words':len(data),'surahs':114}))
