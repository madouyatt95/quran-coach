"""Build static French narration assets locally. Never called by the web server.

Requires kokoro-onnx==0.4.9, soundfile, ffmpeg and the official v1.0 model/voices.
Run export-narrations.mjs first. Checkpoints make interrupted runs resumable.
"""
import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import time
import numpy as np
import onnxruntime as rt
import soundfile as sf
from kokoro_onnx import Kokoro

parser = argparse.ArgumentParser()
parser.add_argument('--model-dir', default='/tmp/qc-narration-model')
parser.add_argument('--key', default='')
parser.add_argument('--limit', type=int, default=0)
parser.add_argument('--worker', type=int, default=0)
parser.add_argument('--workers', type=int, default=1)
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parents[1]
model_dir = pathlib.Path(args.model_dir)
out = root / 'public/audio/narration/fr-v1'
out.mkdir(parents=True, exist_ok=True)
checkpoint = model_dir / 'completed'
checkpoint.mkdir(exist_ok=True)
editorial=json.loads((root/'scripts/narration-editorial.json').read_text())
settings = rt.SessionOptions()
settings.intra_op_num_threads = 2
settings.inter_op_num_threads = 1
session = rt.InferenceSession(str(model_dir / 'kokoro-v1.0.int8.onnx'), sess_options=settings, providers=['CPUExecutionProvider'])
# This export declares float speed, while kokoro-onnx 0.4.9 supplies int32.
original_run = session.run
session.run = lambda names, inputs: original_run(names, {**inputs, 'speed': np.asarray([0.97], dtype=np.float32)})
engine = Kokoro.from_session(session, str(model_dir / 'voices-v1.0.bin'))
precise_engine = None
def full_precision():
    global precise_engine
    if precise_engine is None:
        full = rt.InferenceSession(str(model_dir / 'kokoro-v1.0.onnx'), sess_options=settings, providers=['CPUExecutionProvider'])
        run = full.run
        full.run = lambda names, inputs: run(names, {**inputs, 'speed': np.asarray([0.97], dtype=np.float32)})
        precise_engine = Kokoro.from_session(full, str(model_dir / 'voices-v1.0.bin'))
    return precise_engine

def spoken_text(text):
    # Displayed/source text is never changed; expand conventional symbols for speech only.
    for original,spoken in editorial['spokenNames'].items():
        text=re.sub(r'\b'+re.escape(original)+r'\b',spoken,text)
    return text.replace('ﷺ', 'que la paix et les bénédictions soient sur lui').replace('ﷻ', '').replace('عليه السلام', 'paix sur lui')

cache = model_dir / 'sentences'
cache.mkdir(exist_ok=True)
def synthesize(text):
    cached = cache / (hashlib.sha256(spoken_text(text).encode()).hexdigest() + '.wav')
    if cached.exists(): return sf.read(cached, dtype='float32')
    phonemes = engine.tokenizer.phonemize(spoken_text(text), 'fr-fr')
    # Prevent the library's silent truncation of a very long punctuation-free clause.
    chunks = []
    current = ''
    for word in phonemes.split(' '):
        if len(current) + len(word) + 1 > 450:
            if current: chunks.append(current)
            current = word
        else:
            current = (current + ' ' + word).strip()
    if current: chunks.append(current)
    if not chunks: return np.zeros(2400,dtype=np.float32),24000
    assert all(len(c) < 510 for c in chunks)
    waves = []
    for chunk in chunks:
        wave, sr = engine.create(chunk, voice='ff_siwis', lang='fr-fr', speed=0.97, is_phonemes=True)
        if not np.isfinite(wave).all() or len(wave) < sr * .08:
            wave, sr = full_precision().create(chunk, voice='ff_siwis', lang='fr-fr', speed=0.97, is_phonemes=True)
            if not np.isfinite(wave).all() or len(wave) < sr * .08: raise ValueError(f'Invalid speech output: {text!r}')
        waves.append(wave)
    combined=np.concatenate(waves)
    pending=cached.with_suffix(f'.{args.worker}.tmp.wav')
    sf.write(pending,combined,24000)
    pending.replace(cached)
    return combined, 24000

catalog = json.loads((model_dir / 'catalog.json').read_text())
manifest = {'version': 1, 'voice': 'Kokoro · Siwis', 'engine': 'Kokoro-82M v1.0', 'entries': {}}
started = time.time()
for n, entry in enumerate(catalog[:args.limit or None]):
    if n % args.workers != args.worker or args.key and entry['key']!=args.key: continue
    key = entry['key']
    record = checkpoint / (key + '.json')
    signature=hashlib.sha256(json.dumps({'text':entry['text'],'editorial':editorial},sort_keys=True,ensure_ascii=False).encode()).hexdigest()
    destination = out / (key + '-' + signature[:10] + '.mp3')
    if record.exists() and destination.exists() and json.loads(record.read_text()).get('inputHash')==signature:
        manifest['entries'][key] = json.loads(record.read_text())
        continue
    waves, marks, samples = [], [], 0
    for index, sentence in enumerate(entry['sentences']):
        edit=editorial['sentenceEdits'].get(key+':'+str(index))
        if edit and edit['source']!=sentence: raise ValueError('Stale editorial override: '+key)
        wave, sr = synthesize(edit['spoken'] if edit else sentence)
        marks.append({'sentence': index, 'start': round(samples / sr, 4), 'end': round((samples + len(wave)) / sr, 4)})
        waves.append(wave)
        pause_seconds=editorial['pauseSeconds']['question' if sentence.rstrip().endswith('?') else 'statement']
        if index<len(entry['sentences'])-1 and '\n' in entry['text'].split(sentence,1)[-1][:3]: pause_seconds=editorial['pauseSeconds']['paragraph']
        pause = np.zeros(round(sr * pause_seconds), dtype=np.float32)
        waves.append(pause)
        samples += len(wave) + len(pause)
    wav = model_dir / f'current-{args.worker}.wav'
    sf.write(wav, np.concatenate(waves), sr)
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', str(wav), '-af', 'loudnorm=I=-18:TP=-2:LRA=7', '-ar', '24000', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', str(destination)], check=True)
    info = {'text': entry['text'], 'url': '/audio/narration/fr-v1/' + destination.name, 'duration': round(samples / sr, 4), 'sentences': marks, 'sha256': hashlib.sha256(destination.read_bytes()).hexdigest(), 'inputHash':signature, 'editorialVersion':editorial['version']}
    record.write_text(json.dumps(info, ensure_ascii=False))
    manifest['entries'][key] = info
    print(f'{n+1}/{len(catalog)} | {entry["owners"][0]} | {samples/sr:.1f}s | elapsed {time.time()-started:.0f}s', flush=True)
model_dir.joinpath(f'manifest-{args.worker}.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')))
print('DONE', len(manifest['entries']), flush=True)
