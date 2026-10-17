"""Locate acoustic pauses in existing recordings, without guessing word alignment."""
import json, pathlib, re, subprocess
root=pathlib.Path(__file__).resolve().parents[1]
result={}
for file in sorted((root/'public/audio/hisn').glob('dua_*.mp3')):
    id=int(file.stem.split('_')[1])
    if id in [276,100276]: continue
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(file)]))
    scan=subprocess.run(['ffmpeg','-nostdin','-i',str(file),'-af','silencedetect=noise=-40dB:d=0.45','-f','null','-'],capture_output=True,text=True,check=True).stderr
    boundaries=[0.0]
    start=None
    for kind,value in re.findall(r'silence_(start|end): ([\d.]+)',scan):
        if kind=='start':start=float(value)
        elif start is not None:
            middle=(start+float(value))/2
            if middle-boundaries[-1]>=2 and duration-middle>=2:boundaries.append(round(middle,4))
            start=None
    boundaries.append(duration)
    # Contiguous ranges cover the original file, including all spoken words.
    result[str(id)]={'duration':duration,'ranges':[[a,b] for a,b in zip(boundaries,boundaries[1:])]}
(root/'src/data/adhkarRecordingRanges.json').write_text(json.dumps(result,separators=(',',':')))
print('Recordings indexed:',len(result))
