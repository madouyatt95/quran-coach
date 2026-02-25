from huggingface_hub import HfApi
import os

TOKEN = os.environ.get("HF_TOKEN") or "YOUR_TOKEN_HERE" # Use environment variable for security
REPO_ID = "yatta95/quran-coach-api"

api = HfApi(token=TOKEN)

print("Reading files for upload...")
files_to_upload = ["requirements.txt", "app.py"]

print(f"Uploading files to HuggingFace Hub ({REPO_ID})...")

for filename in files_to_upload:
    if not os.path.exists(filename):
        print(f"Error: {filename} not found!")
        continue
        
    try:
        api.upload_file(
            path_or_fileobj=filename,
            path_in_repo=filename,
            repo_id=REPO_ID,
            repo_type="space"
        )
        print(f"Successfully uploaded {filename}")
    except Exception as e:
        print(f"Failed to upload {filename}: {e}")

print("Done!")
