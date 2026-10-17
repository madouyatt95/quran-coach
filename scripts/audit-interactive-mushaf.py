"""Build reference-only QCF metadata from official API and QUL previews.
No Quran text, fonts or third-party renderer code is bundled by this script.
Usage: python3 scripts/audit-interactive-mushaf.py /tmp/qc-tajwid-research
Two workers, retry/backoff, resumable source snapshots outside the app.
"""
import concurrent.futures, hashlib, html, json, pathlib, sys, time, urllib.request
from html.parser import HTMLParser
ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = pathlib.Path(sys.argv[1]); CACHE.mkdir(parents=True, exist_ok=True)
class Lines(HTMLParser):
    def __init__(self):
        super().__init__(); self.items=[]; self.current=None; self.word=False; self.code=''
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); classes=a.get('class','').split()
        if 'line-container' in classes:
            self.current={'n':int(a['data-line']), 'type':'ayah', 'center':False, 'glyphs':[], 'keys':[]}; self.items.append(self.current)
        if self.current:
            if 'line--surah-name' in classes: self.current['type']='surah'
            if 'line--bismillah' in classes: self.current['type']='basmala'
            if 'line--center' in classes: self.current['center']=True
            if 'data-location' in a:
                self.word=True; self.code=''; self.current['keys'].append(a['data-location'])
    def handle_data(self, data):
        if self.current and self.current['type']=='surah':
            import re
            m=re.search(r'surah(\d{3})',data)
            if m: self.current['surah']=int(m[1])
        if self.word: self.code+=data
    def handle_endtag(self, tag):
        if tag=='a' and self.word:
            self.current['glyphs'].extend(self.code.strip()); self.word=False

def get(url,path):
    if path.exists(): return path.read_text()
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'QuranCoach-layout-audit/1.0'}),timeout=35) as r: text=r.read().decode()
            path.write_text(text); time.sleep(.25); return text
        except Exception:
            if attempt==3: raise
            time.sleep(2**attempt)

def page(p):
    raw=get(f'https://api.quran.com/api/v4/verses/by_page/{p}?words=true&word_fields=code_v2,text_uthmani,text_uthmani_tajweed&language=fr&mushaf=19&per_page=50',CACHE/f'v4-api-{p}.json')
    data=json.loads(raw); assert data['pagination']['next_page'] is None, (p,'pagination')
    markup=get(f'https://qul.tarteel.ai/resources/mushaf-layout/19?page={p}',CACHE/f'qul-{p}.html')
    parser=Lines();parser.feed(markup)
    # Current QUL resource preview uses page=; assert glyph counts/lines rather than trusting URL.
    source=[l for l in parser.items if l['glyphs'] or l['type']!='ayah']
    assert source,(p,'no QUL layout')
    expected=list(dict.fromkeys(':'.join(k.split(':')[:2]) for l in source for k in l['keys']))
    bykey={v['verse_key']:v for v in data['verses']}
    for key in expected:
        if key not in bykey:
            extra=json.loads(get(f'https://api.quran.com/api/v4/verses/by_key/{key}?words=true&word_fields=code_v2,text_uthmani,text_uthmani_tajweed&language=fr&mushaf=19',CACHE/f"verse-{key.replace(':','-')}.json"))
            bykey[key]=extra['verse']
            print('Completed source response',p,key,flush=True)
    if set(bykey)-set(expected): print('Edition boundary correction',p,sorted(set(bykey)-set(expected)),flush=True)
    data['verses']=[bykey[k] for k in expected]
    data['pagination']['total_records']=len(expected)
    (CACHE/f'v4-api-{p}.json').write_text(json.dumps(data,ensure_ascii=False))
    glyphs={g:l['n'] for l in source for g in l['glyphs'] if not g.isspace()}
    words=[(v,w) for v in data['verses'] for w in v['words'] if w['page_number']==p]
    api_glyphs=[g for v,w in words for g in w['code_v2'] if not g.isspace()]
    assert len(api_glyphs)==len(set(api_glyphs)),(p,'duplicate glyph')
    assert set(glyphs)==set(api_glyphs),(p,'QUL/API glyph mismatch',len(glyphs),len(api_glyphs))
    lines={}
    for v,w in words:
        ns={glyphs[g] for g in w['code_v2'] if not g.isspace()}; assert len(ns)==1,(p,'split word',v['verse_key'],w['position'])
        n=ns.pop(); lines.setdefault(str(n),[]).append(f"{v['verse_key']}:{w['position']}")
    canonical=json.dumps([[v['verse_key'],[[w['position'],w['code_v2'],w['text_uthmani'],w['line_number'],w['char_type_name']] for w in v['words']]] for v in data['verses']],ensure_ascii=False,separators=(',',':'))
    meta=[{k:v for k,v in l.items() if k not in ('glyphs','keys')} for l in source]
    for l in meta:
        if l['type']=='surah': assert l.get('surah'),(p,'missing surah')
    return p,{'sha256':hashlib.sha256(canonical.encode()).hexdigest(),'lines':lines,'layout':meta,'verseKeys':[v['verse_key'] for v in data['verses']], 'wordCount':sum(w['char_type_name']=='word' for _,w in words),'endCount':sum(w['char_type_name']=='end' for _,w in words)}

if __name__=='__main__':
    targets=[int(x) for x in sys.argv[2:]] or list(range(1,605)); out={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        for p,item in pool.map(page,targets):
            out[str(p)]=item
            if p%25==0 or len(targets)<10: print('Verified',p,flush=True)
    dest=ROOT/'src/lib/interactiveMushaf/verified-layout.json'
    if len(out)==604:
        assert sum(x['endCount'] for x in out.values())==6236
        assert len({k for x in out.values() for k in x['verseKeys']})==6236
        dest.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
        print('All 604 pages and 6236 verses verified; manifest written.',flush=True)
    else: print(json.dumps(out,ensure_ascii=False)[:1800])
