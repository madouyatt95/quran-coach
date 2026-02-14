import gradio as gr
from transformers import pipeline
import torch

# Load Arabic-specialized Whisper model
print("Loading Whisper V3 Turbo Arabic model...")
device = "cuda" if torch.cuda.is_available() else "cpu"

asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="mboushaba/whisper-large-v3-turbo-arabic",
    device=device,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)
print(f"Model loaded on {device}")

def transcribe_arabic(audio_file):
    """
    Transcribe Arabic speech (Quranic recitation or general).
    Returns Arabic text transcription.
    """
    if audio_file is None:
        return "No audio provided"
    
    try:
        result = asr_pipeline(
            audio_file,
            generate_kwargs={"language": "ar", "task": "transcribe"},
            chunk_length_s=30,
            batch_size=8
        )
        return result["text"]
    except Exception as e:
        return f"Error: {str(e)}"

# Create Gradio interface
demo = gr.Interface(
    fn=transcribe_arabic,
    inputs=gr.Audio(
        sources=["microphone", "upload"],
        type="filepath",
        label="Record or upload Arabic audio"
    ),
    outputs=gr.Textbox(
        label="Transcription",
        rtl=True,
        lines=3
    ),
    title="🕌 Arabic Speech Recognition (Whisper V3 Turbo)",
    description="""
    This space uses **mboushaba/whisper-large-v3-turbo-arabic**, 
    fine-tuned for Arabic speech recognition.
    
    - Record your recitation or upload an audio file
    - Get accurate Arabic transcription
    - Optimized for Quranic Arabic and MSA
    """,
    examples=[],
    allow_flagging="never"
)

# Enable API access
demo.launch()
