import tkinter as tk
from tkinter import filedialog, ttk, messagebox
from PIL import Image, ImageTk
import cv2
from ultralytics import YOLO
import librosa
import numpy as np
import os

# --- Configuración ---
MODEL_PATH = 'yolov8n.pt'   # Modelo Ultralytics
FRAME_SKIP = 30              # Procesar 1 de cada 30 frames (~1 seg)
AUDIO_THRESHOLD = 0.02       # Umbral de pico de disparo
GRID_COLS = 4                # Miniaturas por fila

# --- UI ---
root = tk.Tk()
root.title("Combat Detector Warzone MVP")
root.geometry("1200x700")

video_path_var = tk.StringVar()
progress_var = tk.DoubleVar()

canvas_frame = tk.Frame(root)
canvas_frame.pack(fill="both", expand=True)
canvas = tk.Canvas(canvas_frame)
vscroll = ttk.Scrollbar(canvas_frame, orient="vertical", command=canvas.yview)
canvas.configure(yscrollcommand=vscroll.set)
vscroll.pack(side="right", fill="y")
canvas.pack(side="left", fill="both", expand=True)
image_container = tk.Frame(canvas)
canvas.create_window((0,0), window=image_container, anchor="nw")

frames_images = []

# --- Funciones ---
def select_video():
    path = filedialog.askopenfilename(filetypes=[("MP4 Files", "*.mp4")])
    if path:
        video_path_var.set(path)

def process_video():
    path = video_path_var.get()
    if not path or not os.path.exists(path):
        messagebox.showerror("Error", "Selecciona un video válido")
        return

    # Limpiar UI
    for widget in image_container.winfo_children():
        widget.destroy()
    frames_images.clear()

    # Cargar video
    cap = cv2.VideoCapture(path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Extraer audio
    y, sr = librosa.load(path, sr=None)
    audio_frame_len = int(sr / fps)

    # Modelo YOLO GPU
    model = YOLO(MODEL_PATH)

    frame_idx = 0
    combat_idx = 0
    first_combat_shown = False

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % FRAME_SKIP != 0:
            frame_idx += 1
            continue

        # Detección de enemigos
        results = model(frame, device=0)[0]

        # Filtrar enemigos fuera del HUD inferior
        enemies_detected = []
        for r in results.boxes:
            # xyxy viene como tensor [x1, y1, x2, y2]
            if int(r.cls[0]) == 0:  # clase persona
                box = r.xyxy[0].cpu().numpy()  # convertir tensor a numpy array
                y_top = box[1]
                if y_top < frame_height * 0.8:  # descartar HUD inferior
                    enemies_detected.append(r)

        # Audio del frame
        start = frame_idx * audio_frame_len
        end = start + audio_frame_len
        audio_chunk = y[start:end]
        audio_peak = np.max(np.abs(audio_chunk))

        if len(enemies_detected) > 0 and audio_peak > AUDIO_THRESHOLD:
            # Guardar miniatura
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame_rgb)
            img.thumbnail((200,112))
            imgtk = ImageTk.PhotoImage(img)

            row = combat_idx // GRID_COLS
            col = combat_idx % GRID_COLS
            lbl = tk.Label(image_container, image=imgtk)
            lbl.image = imgtk
            lbl.grid(row=row, column=col, padx=5, pady=5)

            frames_images.append((frame_idx, frame, fps))
            combat_idx += 1

            # Pregunta interactiva al primer combate
            if not first_combat_shown:
                first_combat_shown = True
                resp = messagebox.askyesno("Primer combate detectado",
                                           "Se detectó el primer combate. ¿Continuar procesando el resto del video?")
                if not resp:
                    print("Proceso detenido por el usuario.")
                    break

        frame_idx += 1
        progress_var.set(frame_idx / total_frames * 100)
        root.update_idletasks()

    cap.release()
    canvas.update_idletasks()
    canvas.config(scrollregion=canvas.bbox("all"))

    print(f"Combates detectados: {len(frames_images)}")
    for idx, frame, fps in frames_images:
        print(f"Combate aproximado: minuto {idx/fps/60:.2f} | frame {idx}")

# --- Widgets ---
tk.Label(root, text="Video:").pack(side="top", anchor="w")
tk.Entry(root, textvariable=video_path_var, width=70).pack(side="top", padx=5)
tk.Button(root, text="Seleccionar Video", command=select_video).pack(side="top", pady=5)
tk.Button(root, text="Procesar (GPU + Audio + HUD filter)", command=process_video).pack(side="top", pady=5)
ttk.Progressbar(root, variable=progress_var, maximum=100, length=500).pack(side="top", pady=5)

root.mainloop()