import noisereduce as nr
import librosa
import soundfile as sf
import numpy as np

# Leggi l'audio dal video
audio_file = '43da1e5278fc4b058f7874b44b898c6d_-12lufs.mp4'
data, rate = librosa.load(audio_file, sr=None)

print(f'Audio loaded: {len(data)} samples at {rate} Hz')

# Applica riduzione rumore con algoritmo spettrale avanzato
reduced_noise = nr.reduce_noise(
    y=data, 
    sr=rate,
    prop_decrease=0.8,  # Riduci il rumore dell'80%
    stationary=False,   # Rumore non stazionario (più efficace)
    time_mask_smooth_ms=50,
    freq_mask_smooth_hz=500
)

print('Noise reduction completed')

# Salva l'audio pulito
sf.write('audio_ai_denoised.wav', reduced_noise, rate)
print('AI denoised audio saved as audio_ai_denoised.wav')
