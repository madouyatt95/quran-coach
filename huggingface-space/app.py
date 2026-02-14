import gradio as gr
from transformers import pipeline

# Load Tarteel Whisper — specialized for Quranic Arabic, lightweight for free CPU
print("Loading Tarteel Whisper (Quranic Arabic) model...")

asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="tarteel-ai/whisper-base-ar-quran",
    chunk_length_s=30,
    batch_size=1
)
print("Model loaded successfully on CPU")

def transcribe_quran(audio_file):
    """
    Transcribe Quranic Arabic recitation.
    Uses Tarteel AI's Whisper model fine-tuned on Quranic data.
    """
    if audio_file is None:
        return "No audio provided"
    
    try:
        result = asr_pipeline(
            audio_file,
            generate_kwargs={"language": "ar", "task": "transcribe"}
        )
        return result["text"]
    except Exception as e:
        return f"Error: {str(e)}"

# Create Gradio interface
demo = gr.Interface(
    fn=transcribe_quran,
    inputs=gr.Audio(
        sources=["microphone", "upload"],
        type="filepath",
        label="Record or upload Quranic recitation"
    ),
    outputs=gr.Textbox(
        label="Transcription",
        rtl=True,
        lines=3
    ),
    title="🕌 Quran Speech Recognition (Tarteel AI)",
    description="""
    Quranic Arabic speech recognition powered by **Tarteel AI Whisper**.
    Fine-tuned specifically on Quranic recitation for maximum accuracy.
    
    - Record your recitation or upload an audio file
    - Get accurate Arabic transcription
    - Optimized for Quranic Arabic
    """,
    examples=[],
    allow_flagging="never"
)

demo.launch()
