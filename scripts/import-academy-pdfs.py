"""Import approved course PDFs, preserving originals and every extracted page.
Usage: bundled-python scripts/import-academy-pdfs.py
Future editions must use stable course IDs and explicitly reviewed chapter boundaries.
"""
import json,re,hashlib,shutil
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
SOURCES=[('tawhid','Tawhid_Masjid_Sabirin_Support_Premium_Corrige.pdf','Tawhîd — Masjid Sabirin','aqidah'),('hadith','Hadith_Masjid_Sabirin_Support_Premium_Bleu (1).pdf','Hadîth — Masjid Sabirin','hadith')]
for key,name,title,subject in SOURCES:
 src=Path('/Users/admin/Downloads')/name;reader=PdfReader(src)
 pages=[];chapters=[]
 for n,page in enumerate(reader.pages,1):
  raw=page.extract_text() or ''
  assert raw.strip(),f'Empty page {key}:{n}'
  lines=raw.splitlines()
  # Remove only repeating running header/footer. rawText retains the exact extraction.
  body=lines[:]
  if n>1:
   body=body[2:]
   if re.fullmatch(r'\d+\s*/\s*\d+',body[-1].strip()):body=body[:-2]
  text='\n'.join(body).strip()
  pages.append({'page':n,'text':text,'rawText':raw})
  if key=='tawhid':
   match=re.search(r'^MODULE (\d+)\n[^\n]+\n(.*?)\nDANS CE MODULE',text,re.M|re.S)
  else:match=re.search(r'^HADÎTH N°(\d+)\n([^\n]+)',text,re.M)
  if match:chapters.append({'number':int(match[1]),'title':match[2].replace('\n',' '),'start':n})
 assert len(chapters)==(10 if key=='tawhid' else 20)
 chapters.insert(0,{'number':0,'title':'Présentation et introduction','start':1})
 for i,ch in enumerate(chapters):ch['end']=chapters[i+1]['start']-1 if i+1<len(chapters) else len(pages)
 dst=ROOT/'public/academy/courses'/f'sabirin-{key}.pdf';shutil.copyfile(src,dst)
 data={'id':f'sabirin-{key}','title':title,'subject':subject,'author':'Abd-Allah Drame','publisher':'Masjid Sabirin','pdf':f'/academy/courses/sabirin-{key}.pdf','sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'pageCount':len(pages),'chapters':chapters,'pages':pages}
 (ROOT/'src/academy/data/courses'/f'{key}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
 print(key,len(pages),'pages preserved;',len(chapters)-1,'chapters;',data['sha256'])
