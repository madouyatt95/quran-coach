import gradio as gr
from transformers import pipeline
import torch

# Load the Tarteel Quran-specific Whisper model
print("Loading Tarteel Quran ASR model...")
device = "cuda" if torch.cuda.is_available() else "cpu"

# Use the Tarteel fine-tuned model for Quran
asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="tarteel-ai/whisper-base-ar-quran",
    device=device
)
print(f"Model loaded on {device}")

def transcribe_quran(audio_file):
    """
    Transcribe Quranic recitation from audio file.
    Returns Arabic text transcription.
    """
    if audio_file is None:
        return "No audio provided"
    
    try:
        # Transcribe with Arabic language hint
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
        label="Record or upload Quran recitation"
    ),
    outputs=gr.Textbox(
        label="Transcription",
        rtl=True,  # Right-to-left for Arabic
        lines=3
    ),
    title="🕌 Quran Speech Recognition (Tarteel AI)",
    description="""
    This space uses the **tarteel-ai/whisper-base-ar-quran** model, 
    fine-tuned specifically for Quranic Arabic recitation.
    
    - Record your recitation or upload an audio file
    - Get accurate Arabic transcription
    """,
    examples=[],
    allow_flagging="never"
)

# Enable API access
demo.launch()
