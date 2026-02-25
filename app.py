import gradio as gr
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import torch
import os

# --- Configuration ---
MODEL_ID = "MaddoggProduction/whisper-l-v3-turbo-quran-lora-dataset-mix"
DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"
TORCH_DTYPE = torch.float16 if torch.cuda.is_available() else torch.float32

print(f"Loading model {MODEL_ID} on {DEVICE}...")

# Global pipe variable
pipe = None

try:
    # Explicit loading to control memory usage on CPU Spaces
    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        MODEL_ID, 
        torch_dtype=TORCH_DTYPE, 
        low_cpu_mem_usage=True, 
        use_safetensors=True
    )
    model.to(DEVICE)
    
    processor = AutoProcessor.from_pretrained(MODEL_ID)

    pipe = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        torch_dtype=TORCH_DTYPE,
        device=DEVICE,
        chunk_length_s=30,
        stride_length_s=3,
    )
    print("✓ Pipeline successfully initialized.")
except Exception as e:
    print(f"CRITICAL ERROR loading model: {e}")
    pipe = None

def transcribe(audio_path):
    if audio_path is None:
        return "Aucun fichier audio reçu."
    
    if pipe is None:
        return "Erreur : Le modèle de reconnaissance vocale n'est pas prêt. L'Espace est peut-être en train de redémarrer ou manque de mémoire RAM."
    
    try:
        print(f"Processing audio: {audio_path}")
        result = pipe(
            audio_path, 
            generate_kwargs={
                "language": "arabic", 
                "task": "transcribe"
            }
        )
        return result["text"]
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return f"Erreur lors de la transcription : {str(e)}"

# Gradio Interface
demo = gr.Interface(
    fn=transcribe,
    inputs=gr.Audio(type="filepath", label="Enregistrement Coran"),
    outputs=gr.Textbox(label="Transcription (Texte Coranique)"),
    title="Verset Coach ASR - Whisper V3 Turbo",
    description="Reconnaissance vocale optimisée pour le Coran. Note : Le premier chargement peut être lent sur les serveurs gratuits.",
    examples=[]
)

if __name__ == "__main__":
    demo.launch()
