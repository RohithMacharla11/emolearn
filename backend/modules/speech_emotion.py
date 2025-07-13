import pyaudio
import numpy as np
import pandas as pd
import librosa
import speech_recognition as sr
from datetime import datetime
import threading
from queue import Queue
import time
import json
from collections import deque
import difflib
import torch
import logging
import os
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Audio configuration
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 512
WINDOW_SECONDS = 0.3
SILENCE_TIMEOUT = 10

# Load or initialize emotion weights
WEIGHTS_FILE = "emotion_weights.json"
def load_weights():
    try:
        if os.path.exists(WEIGHTS_FILE):
            with open(WEIGHTS_FILE, 'r') as f:
                return json.load(f)
        return {
            "Confused": {
                "what is it": 1.1, "can't understand": 1.0, "confused": 1.0, "huh": 1.0, "what": 1.1,
                "I don't get it": 1.1, "I'm lost": 1.0, "this doesn't make sense": 1.0, "wait, what?": 1.0,
                "I'm not sure": 1.0, "can you repeat that?": 1.0, "I'm puzzled": 1.0, "this is confusing": 1.0,
                "doesn't add up": 1.0, "I'm unclear": 1.0, "no idea": 1.0, "makes no sense": 1.0, "wait a second": 1.0,
                "what do you mean": 1.0, "not following": 1.0, "I missed that": 1.0, "that went over my head": 1.0
            },
            "Frustrated": {
                "dammit": 1.0, "damn": 1.0, "ugh": 1.0, "frustrated": 1.0, "stupid": 1.0,
                "this is annoying": 1.0, "I'm fed up": 1.0, "I can't believe this": 1.0, "this is ridiculous": 1.0,
                "so irritating": 1.0, "why is this happening": 1.0, "makes me mad": 1.0, "I'm done": 1.0, "seriously?": 1.0,
                "this sucks": 1.0, "I'm pissed": 1.0, "I'm losing it": 1.0, "I'm tired of this": 1.0, "screw this": 1.0,
                "enough already": 1.0, "come on": 1.0, "you've got to be kidding": 1.0
            },
            "Engaged": {
                "okay": 1.0, "got it": 1.0, "yes": 1.0, "cool": 1.0, "great": 1.0,
                "I understand": 1.0, "that makes sense": 1.0, "I'm with you": 1.0, "I'm following": 1.0,
                "right": 1.0, "exactly": 1.0, "totally": 1.0, "yep": 1.0, "sounds good": 1.0, "uh-huh": 1.0, "perfect": 1.0,
                "I'm interested": 1.0, "tell me more": 1.0, "go on": 1.0, "nice": 1.0, "wow": 1.0, "really?": 1.0,
                "that's awesome": 1.0, "this is exciting": 1.0, "I love this": 1.0, "fascinating": 1.0, "that's brilliant": 1.0
            },
            "Bored": {
                "whatever": 1.0, "I don't care": 1.0, "so dull": 1.0, "boring": 1.1, "meh": 1.0,
                "not interested": 1.1, "I'm yawning": 1.0, "why bother": 1.0, "again?": 1.0, "same old": 1.0,
                "ugh": 1.0, "over it": 1.0, "unexciting": 1.0, "nothing new": 1.0, "heard it before": 1.0, "this again?": 1.0,
                "I'm zoning out": 1.0, "blah blah": 1.0, "nothing exciting": 1.0, "checked out": 1.0, "done listening": 1.0
            },
            "Sleepy": {
                "sleepy": 1.1, "yawn": 1.0, "tired": 1.0, "I'm dozing": 1.0, "I'm drowsy": 1.0,
                "need rest": 1.0, "can't stay awake": 1.0, "zzzz": 1.0, "just woke up": 1.0, "need sleep": 1.0,
                "nodding off": 1.0, "barely awake": 1.0, "falling asleep": 1.0, "so sleepy": 1.0, "low energy": 1.0,
                "worn out": 1.0, "exhausted": 1.0, "long day": 1.0, "my eyes are closing": 1.0, "snoozing": 1.0
            }
        }
    except Exception as e:
        logger.error(f"Error loading weights: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "Confused": {}, "Frustrated": {}, "Engaged": {}, "Bored": {}, "Sleepy": {}
        }

def save_weights(weights):
    try:
        with open(WEIGHTS_FILE, 'w') as f:
            json.dump(weights, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving weights: {str(e)}")
        logger.error(traceback.format_exc())

# Audio thresholds
AUDIO_THRESHOLDS = {
    "Confused": {"pitch_std_min": 15},
    "Frustrated": {"pitch_min": 170},
    "Engaged": {"pitch_range": (120, 165)},
    "Bored": {"pitch_max": 130},
    "Sleepy": {"zcr_max": 0.015}
}

EMOTION_WEIGHTS = load_weights()
result_queue = Queue()

# Shared state
STATE = {
    "running": False,
    "last_emotion": "Engaged",
    "latest_text": "",
    "last_change_time": time.time(),
    "last_speech_time": time.time(),
    "pyaudio_instance": None,
    "stream": None,
    "pitch_buffer": deque(maxlen=3),
    "zcr_buffer": deque(maxlen=3),
    "device": "0",
    "lock": threading.Lock(),
    "transcription": ""
}

def match_keyword(text, keywords, weights):
    try:
        text = text.lower().strip()
        best_score = 0
        best_keyword = None
        for keyword in keywords:
            similarity = difflib.SequenceMatcher(None, text, keyword.lower()).ratio()
            score = similarity * weights.get(keyword, 1.0)
            if score > 0.8 or keyword.lower() in text:
                if score > best_score:
                    best_score = score
                    best_keyword = keyword
        logger.debug(f"Text: '{text}', Best keyword: {best_keyword}, Score: {best_score:.2f}")
        return best_keyword, best_score
    except Exception as e:
        logger.error(f"Error in keyword matching: {str(e)}")
        return None, 0

def extract_features(audio_data, device):
    try:
        if len(audio_data) < CHUNK // 2:
            logger.debug(f"Skipping short audio data: {len(audio_data)} bytes")
            return None
        audio_float = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
        if np.all(audio_float == 0):
            logger.debug("Skipping silent audio data")
            return None
        pitches, magnitudes = librosa.piptrack(y=audio_float, sr=RATE, hop_length=CHUNK // 4)
        valid_pitches = pitches[magnitudes > np.max(magnitudes) * 0.1]
        pitch = np.mean(valid_pitches) if len(valid_pitches) > 0 else 100
        pitch = pitch if not np.isnan(pitch) and pitch > 0 else 100
        pitch_std = np.std(valid_pitches) if len(valid_pitches) > 0 else 0
        zcr = np.mean(librosa.feature.zero_crossing_rate(y=audio_float, hop_length=CHUNK // 4)[0])
        if device == "0" and torch.cuda.is_available():
            audio_tensor = torch.tensor(audio_float, device="cuda")
            zcr_tensor = torch.mean(torch.abs(audio_tensor[1:] - audio_tensor[:-1]) / 2)
            zcr = zcr_tensor.cpu().numpy()
        waveform_data = audio_float[::4].tolist()
        logger.debug(f"Extracted features: pitch={pitch:.1f}, pitch_std={pitch_std:.1f}, zcr={zcr:.3f}")
        return {
            "pitch": pitch,
            "pitch_std": pitch_std,
            "zcr": zcr,
            "waveform_data": waveform_data
        }
    except Exception as e:
        logger.error(f"Feature extraction error: {str(e)}")
        logger.error(traceback.format_exc())
        return None

def classify_emotion(text, pitch, pitch_std, zcr):
    try:
        logger.debug(f"Classifying emotion: text='{text}', pitch={pitch:.1f}, pitch_std={pitch_std:.1f}, zcr={zcr:.3f}")
        if text:
            emotion_scores = []
            for emotion in EMOTION_WEIGHTS:
                keyword, score = match_keyword(text, EMOTION_WEIGHTS[emotion].keys(), EMOTION_WEIGHTS[emotion])
                if keyword:
                    emotion_scores.append((emotion, score, keyword))
            if emotion_scores:
                emotion_scores.sort(key=lambda x: x[1], reverse=True)
                top_emotion, _, top_keyword = emotion_scores[0]
                logger.debug(f"Top emotion: {top_emotion}, keyword='{top_keyword}'")
                if top_emotion == "Confused" and pitch_std > AUDIO_THRESHOLDS["Confused"]["pitch_std_min"]:
                    logger.info(f"Classified as Confused: keyword='{top_keyword}', pitch_std={pitch_std:.1f}")
                    return "Confused"
                elif top_emotion == "Frustrated" and pitch > AUDIO_THRESHOLDS["Frustrated"]["pitch_min"]:
                    logger.info(f"Classified as Frustrated: keyword='{top_keyword}', pitch={pitch:.1f}")
                    return "Frustrated"
                elif top_emotion == "Engaged" and AUDIO_THRESHOLDS["Engaged"]["pitch_range"][0] < pitch < AUDIO_THRESHOLDS["Engaged"]["pitch_range"][1]:
                    logger.info(f"Classified as Engaged: keyword='{top_keyword}', pitch={pitch:.1f}")
                    return "Engaged"
                elif top_emotion == "Bored" and pitch < AUDIO_THRESHOLDS["Bored"]["pitch_max"]:
                    logger.info(f"Classified as Bored: keyword='{top_keyword}', pitch={pitch:.1f}")
                    return "Bored"
                elif top_emotion == "Sleepy" and zcr < AUDIO_THRESHOLDS["Sleepy"]["zcr_max"]:
                    logger.info(f"Classified as Sleepy: keyword='{top_keyword}', zcr={zcr:.3f}")
                    return "Sleepy"
                else:
                    logger.debug(f"Top emotion {top_emotion} matched but audio features not met")
                    return "Engaged"
        if pitch < AUDIO_THRESHOLDS["Bored"]["pitch_max"]:
            logger.info(f"Classified as Bored: pitch={pitch:.1f}")
            return "Bored"
        elif zcr < AUDIO_THRESHOLDS["Sleepy"]["zcr_max"]:
            logger.info(f"Classified as Sleepy: zcr={zcr:.3f}")
            return "Sleepy"
        logger.debug("Defaulting to Engaged")
        return "Engaged"
    except Exception as e:
        logger.error(f"Error classifying emotion: {str(e)}")
        logger.error(traceback.format_exc())
        return "Engaged"

def log_emotion(emotion, text, pitch, pitch_std, zcr):
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = {
            "timestamp": timestamp, "emotion": emotion, "text": text,
            "pitch": f"{pitch:.2f}" if pitch else "0.00",
            "pitch_std": f"{pitch_std:.2f}" if pitch_std else "0.00",
            "zcr": f"{zcr:.4f}" if zcr else "0.0000",
            "source": "speech"
        }
        logger.info(f"Logged emotion: {emotion}, Text: '{text}'")
        pd.DataFrame([log_entry]).to_csv("emotion_log.csv", mode='a', index=False, header=not os.path.exists("emotion_log.csv"))
    except Exception as e:
        logger.error(f"Error logging emotion: {str(e)}")
        logger.error(traceback.format_exc())

def process_speech_recognition():
    try:
        recognizer = sr.Recognizer()
        microphone = sr.Microphone()
        with microphone as source:
            recognizer.adjust_for_ambient_noise(source, duration=2)
            logger.info("Speech recognition initialized")
            while STATE["running"]:
                try:
                    audio = recognizer.listen(source, timeout=2, phrase_time_limit=5)
                    text = recognizer.recognize_google(audio)
                    with STATE["lock"]:
                        STATE["transcription"] = text
                        STATE["latest_text"] = text
                        STATE["last_speech_time"] = time.time()
                    logger.info(f"Recognized speech: {text}")
                except sr.WaitTimeoutError:
                    continue
                except sr.UnknownValueError:
                    logger.debug("Speech not understood")
                    continue
                except sr.RequestError as e:
                    logger.error(f"Speech recognition request error: {str(e)}")
                    time.sleep(1)
                except Exception as e:
                    logger.error(f"Speech recognition error: {str(e)}")
                    logger.error(traceback.format_exc())
                    time.sleep(1)
    except Exception as e:
        logger.error(f"Error initializing speech recognition: {str(e)}")
        logger.error(traceback.format_exc())

def process_audio():
    threading.current_thread().setName("AudioProcessing")
    frames = []
    try:
        while STATE["running"]:
            try:
                data = STATE["stream"].read(CHUNK, exception_on_overflow=False)
                if not data or len(data) == 0:
                    logger.debug("Empty audio data")
                    continue
                frames.append(data)
                if len(frames) * CHUNK / RATE >= WINDOW_SECONDS:
                    audio_data = b''.join(frames)
                    frames = []
                    features = extract_features(audio_data, STATE["device"])
                    if not features:
                        continue
                    pitch = features["pitch"]
                    pitch_std = features["pitch_std"]
                    zcr = features["zcr"]
                    waveform_data = features["waveform_data"]
                    with STATE["lock"]:
                        STATE["pitch_buffer"].append(pitch)
                        STATE["zcr_buffer"].append(zcr)
                        avg_pitch = np.mean(STATE["pitch_buffer"])
                        avg_zcr = np.mean(STATE["zcr_buffer"])
                        text = STATE["latest_text"]
                        if time.time() - STATE["last_speech_time"] > SILENCE_TIMEOUT and text:
                            STATE["latest_text"] = ""
                            STATE["transcription"] = ""
                            STATE["last_emotion"] = "Engaged"
                            STATE["last_speech_time"] = time.time()
                            log_emotion("Engaged", "", 0, 0, 0)
                            text = ""
                    current_emotion = classify_emotion(text, avg_pitch, pitch_std, avg_zcr)
                    with STATE["lock"]:
                        if current_emotion != STATE["last_emotion"] and time.time() - STATE["last_change_time"] >= 2:
                            STATE["last_emotion"] = current_emotion
                            STATE["last_change_time"] = time.time()
                            log_emotion(current_emotion, text, avg_pitch, pitch_std, avg_zcr)
                    result_queue.put({
                        "emotion": current_emotion,
                        "pitch": f"{avg_pitch:.1f}",
                        "zcr": f"{avg_zcr:.3f}",
                        "waveform": waveform_data
                    })
            except Exception as e:
                logger.error(f"Audio processing error: {str(e)}")
                logger.error(traceback.format_exc())
                time.sleep(0.1)
    finally:
        try:
            if STATE["stream"]:
                STATE["stream"].stop_stream()
                STATE["stream"].close()
                STATE["stream"] = None
            if STATE["pyaudio_instance"]:
                STATE["pyaudio_instance"].terminate()
                STATE["pyaudio_instance"] = None
            logger.info("Audio stream closed")
        except Exception as e:
            logger.error(f"Error closing audio stream: {str(e)}")
            logger.error(traceback.format_exc())

def start_speech_emotion_detection():
    try:
        with STATE["lock"]:
            if STATE["running"]:
                logger.warning("Speech detection already running")
                return
            STATE["running"] = True
            STATE["last_emotion"] = "Engaged"
            STATE["latest_text"] = ""
            STATE["transcription"] = ""
            STATE["last_change_time"] = time.time()
            STATE["last_speech_time"] = time.time()
        for attempt in range(3):
            try:
                with STATE["lock"]:
                    STATE["pyaudio_instance"] = pyaudio.PyAudio()
                    STATE["stream"] = STATE["pyaudio_instance"].open(
                        format=FORMAT, channels=CHANNELS, rate=RATE, input=True,
                        frames_per_buffer=CHUNK, input_device_index=None)
                    STATE["stream"].start_stream()
                logger.info("Audio stream started")
                break
            except Exception as e:
                logger.error(f"Attempt {attempt+1}/3 to start audio stream failed: {str(e)}")
                logger.error(traceback.format_exc())
                if STATE["pyaudio_instance"]:
                    try:
                        STATE["pyaudio_instance"].terminate()
                        STATE["pyaudio_instance"] = None
                    except:
                        pass
                time.sleep(1)
                if attempt == 2:
                    with STATE["lock"]:
                        STATE["running"] = False
                    raise Exception("Failed to start audio stream")
        threading.Thread(target=process_audio, daemon=True).start()
        threading.Thread(target=process_speech_recognition, daemon=True).start()
    except Exception as e:
        logger.error(f"Error starting speech processing: {str(e)}")
        logger.error(traceback.format_exc())
        with STATE["lock"]:
            STATE["running"] = False
        try:
            if STATE["pyaudio_instance"]:
                STATE["pyaudio_instance"].terminate()
                STATE["pyaudio_instance"] = None
        except Exception as e:
            logger.error(f"Error cleaning up pyaudio: {str(e)}")
            logger.error(traceback.format_exc())

def stop_speech_emotion_detection():
    try:
        with STATE["lock"]:
            STATE["running"] = False
        time.sleep(0.1)
        try:
            if STATE["stream"]:
                STATE["stream"].stop_stream()
                STATE["stream"].close()
                STATE["stream"] = None
            if STATE["pyaudio_instance"]:
                STATE["pyaudio_instance"].terminate()
                STATE["pyaudio_instance"] = None
            logger.info("Speech emotion detection stopped")
        except Exception as e:
            logger.error(f"Error stopping speech stream: {str(e)}")
            logger.error(traceback.format_exc())
    except Exception as e:
        logger.error(f"Error stopping speech detection: {str(e)}")
        logger.error(traceback.format_exc())

def get_speech_emotion():
    try:
        with STATE["lock"]:
            return STATE["last_emotion"]
    except Exception as e:
        logger.error(f"Error getting speech emotion: {str(e)}")
        logger.error(traceback.format_exc())
        return "Engaged"

def get_speech_transcription():
    try:
        with STATE["lock"]:
            return STATE["transcription"]
    except Exception as e:
        logger.error(f"Error getting transcription: {str(e)}")
        logger.error(traceback.format_exc())
        return ""
    
# if __name__ == "__main__":
#     print("🔊 Starting Voice Emotion Detection...")
#     start_speech_emotion_detection()
#     try:
#         while True:
#             emotion = get_speech_emotion()
#             print(f"[Voice Emotion]: {emotion}")
#             time.sleep(2)  # Check every 2 seconds
#     except KeyboardInterrupt:
#         print("🛑 Stopping Voice Emotion Detection")
#         stop_speech_emotion_detection()