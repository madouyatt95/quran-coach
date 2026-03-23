import os
import sys

try:
    from PIL import Image, ImageFilter
except ImportError:
    print("Pillow library not found. Installing it now...")
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'Pillow'])
    from PIL import Image, ImageFilter

input_dir = r"C:\Users\madou\.gemini\antigravity\scratch\quran-coach-app\appstore-screenshots"
output_dir = os.path.join(input_dir, "iphone69")

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Taille exacte requise pour iPhone 6.9 pouces
target_size = (1320, 2868)

for filename in os.listdir(input_dir):
    if filename.lower().endswith('.png') or filename.lower().endswith('.jpg'):
        filepath = os.path.join(input_dir, filename)
        try:
            img = Image.open(filepath)
            img = img.convert("RGB")
            
            # 1. Création de l'arrière-plan flouté (pour une finition très pro)
            img_ratio = img.width / img.height
            target_ratio = target_size[0] / target_size[1]
            
            if img_ratio > target_ratio:
                # L'image originale est plus large que le ratio cible, on cale sur la hauteur
                new_h = target_size[1]
                new_w = int(new_h * img_ratio)
            else:
                # L'image est plus étirée en hauteur, on cale sur la largeur
                new_w = target_size[0]
                new_h = int(new_w / img_ratio)
            
            # On redimensionne l'image pour qu'elle couvre tout le fond
            bg_img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # On recadre le centre pour avoir exactement 1320x2868
            left = (bg_img.width - target_size[0]) // 2
            top = (bg_img.height - target_size[1]) // 2
            bg_img = bg_img.crop((left, top, left + target_size[0], top + target_size[1]))
            
            # On applique un flou gaussien massif
            bg_img = bg_img.filter(ImageFilter.GaussianBlur(30))
            
            # 2. Ajout de l'image originale centrée sans la couper
            if img_ratio > target_ratio:
                # On la cale sur la largeur
                fit_w = target_size[0]
                fit_h = int(fit_w / img_ratio)
            else:
                # On la cale sur la hauteur
                fit_h = target_size[1]
                fit_w = int(fit_h * img_ratio)
                
            fg_img = img.resize((fit_w, fit_h), Image.Resampling.LANCZOS)
            
            # On la colle parfaitement au centre
            fg_left = (target_size[0] - fit_w) // 2
            fg_top = (target_size[1] - fit_h) // 2
            
            # (Optionnel) Ajout d'une très légère bordure sombre / ombre portée si besoin, mais on reste simple
            bg_img.paste(fg_img, (fg_left, fg_top))
            
            out_path = os.path.join(output_dir, filename)
            bg_img.save(out_path, format="PNG")
            print(f"Succès -> {filename} converti en 1320x2868.")
        except Exception as e:
            print(f"Erreur avec {filename}: {e}")

print("\nTerminé ! Les images ont été générées dans le dossier 'iphone69'.")
