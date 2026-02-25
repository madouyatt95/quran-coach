import gradio as gr
from transformers import pipeline
import torch

print("Loading Quran Whisper V3 Turbo model...")
# Using the pipeline with some recommended settings for Turbo models
try:
    pipe = pipeline(
        "automatic-speech-recognition",
        model="MaddoggProduction/whisper-l-v3-turbo-quran-lora-dataset-mix",
        device="cpu", # Defaulting to CPU for free tier Spaces, use "cuda:0" if GPU is available
        chunk_length_s=30,
        stride_length_s=3, # Recommended for Turbo models to avoid repetition loops
    )
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    pipe = None

def transcribe(audio_path):
    if audio_path is None:
        return ""
    if pipe is None:
        return "Erreur : Le modèle n'a pas pu être chargé sur le serveur."
    
    try:
        # Generate with specific language to ensure Arabic
        result = pipe(audio_path, generate_kwargs={"language": "arabic", "task": "transcribe"})
        return result["text"]
    except Exception as e:
        print(f"Transcription error: {e}")
        return f"Error: {str(e)}"

demo = gr.Interface(
    fn=transcribe,
    inputs=gr.Audio(type="filepath"),
    outputs="text",
    title="Quran Coach ASR",
    description="Arabic Quran Speech Recognition powered by Whisper V3 Turbo (LoRA fine-tuned)"
)

demo.launch()
