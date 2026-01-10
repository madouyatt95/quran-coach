# 🕌 Quran ASR - HuggingFace Space

Speech recognition optimized for Quranic Arabic recitation.

Uses [tarteel-ai/whisper-base-ar-quran](https://huggingface.co/tarteel-ai/whisper-base-ar-quran).

## Features
- Fine-tuned on Quranic recitations
- ~90% accuracy on Quranic Arabic
- Supports microphone and file upload

## API Usage

```python
from gradio_client import Client

client = Client("YOUR_USERNAME/quran-asr")
result = client.predict(
    audio_file="path/to/recitation.wav",
    api_name="/predict"
)
print(result)  # Arabic transcription
```
