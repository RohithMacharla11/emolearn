import cv2
import mediapipe as mp
import numpy as np
from deepface import DeepFace
import time
import pandas as pd
from datetime import datetime
import threading
import logging
import os
from collections import deque
import traceback

# Suppress TensorFlow warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Configure logging to match other modules
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Shared State and Constants ---
STATE = {
    "running": False,
    "last_emotion": "Engaged",
    "lock": threading.Lock(),
    "log_data": [],
    "emotion_history": deque(maxlen=15),  # Aligned with mouse_emotion.py for smoothing
    "camera_available": False,
    "last_camera_check": 0
}

# Emotion index mapping (keep as is)
emotion_index = {"Engaged": 0, "Confused": 1, "Frustrated": 2, "Bored": 3, "Sleepy": 4, "Unknown": 5}

# Constants for emotion detection thresholds (tuned for less sensitivity)
FRUSTRATION_PROB_THRESHOLD = 0.40  # Increased from 0.35 to 0.40 for even less sensitivity
EAR_THRESHOLD_SLEEPY = 0.20       # Slightly increased for less sensitivity to minor blinks
MAR_THRESHOLD_YAWN = 0.45         # Slightly increased for less sensitivity to minor mouth movements
PITCH_NEUTRAL_RANGE = (0.00, 0.15)  # Keep as is for now
EYES_CLOSED_DURATION_SLEEPY = 2.0  # Increased from 1.5 to 2.0 seconds
YAWN_DURATION_BORED = 2.5         # Increased from 2.0 to 2.5 seconds
NO_FACE_DURATION_BORED = 4.0      # Increased from 3.0 to 4.0 seconds for 'Bored' if no face
GAZE_AWAY_THRESHOLD = 45          # Increased from 30 for less sensitivity to gaze shifts
HEAD_TILT_THRESHOLD = 0.12        # Increased from 0.1 for less sensitivity to head tilts
EMOTION_LOCK_DURATION = 5         # Aligned with previous update for stability
CAMERA_RETRY_INTERVAL = 10        # Retry camera access every 10 seconds

# --- MediaPipe Setup ---
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    min_detection_confidence=0.7  # Increased detection confidence
)
cap = None

# --- Camera Management Functions ---

def check_camera_availability():
    """Check if camera is available without blocking other processes."""
    global cap
    try:
        # Only check camera availability every 10 seconds to reduce conflicts
        current_time = time.time()
        if current_time - STATE["last_camera_check"] < CAMERA_RETRY_INTERVAL:
            return STATE["camera_available"]
        
        STATE["last_camera_check"] = current_time
        
        # Try to open camera briefly
        test_cap = cv2.VideoCapture(0)
        if test_cap.isOpened():
            ret, frame = test_cap.read()
            test_cap.release()
            if ret:
                STATE["camera_available"] = True
                return True
            else:
                STATE["camera_available"] = False
                return False
        else:
            STATE["camera_available"] = False
            return False
    except Exception as e:
        logger.debug(f"Camera availability check failed: {str(e)}")
        STATE["camera_available"] = False
        return False

def safe_camera_release():
    """Safely release camera resources."""
    global cap
    if cap is not None:
        try:
            cap.release()
            cap = None
        except Exception as e:
            logger.debug(f"Error releasing camera: {str(e)}")

# --- Facial Metric Calculation Functions ---

def calculate_ear(points, landmarks, w, h):
    """Calculate Eye Aspect Ratio (EAR) for an eye."""
    try:
        coords = [(int(landmarks.landmark[p].x * w), int(landmarks.landmark[p].y * h)) for p in points]
        A = np.linalg.norm(np.array(coords[1]) - np.array(coords[5]))
        B = np.linalg.norm(np.array(coords[2]) - np.array(coords[4]))
        C = np.linalg.norm(np.array(coords[0]) - np.array(coords[3]))
        return (A + B) / (2.0 * C) if C != 0 else 0
    except Exception as e:
        logger.error(f"Error calculating EAR: {str(e)}")
        logger.debug(traceback.format_exc())
        return 0

def calculate_mar(points, landmarks, w, h):
    """Calculate Mouth Aspect Ratio (MAR)."""
    try:
        coords = [(int(landmarks.landmark[p].x * w), int(landmarks.landmark[p].y * h)) for p in points]
        A = np.linalg.norm(np.array(coords[2]) - np.array(coords[6]))
        B = np.linalg.norm(np.array(coords[0]) - np.array(coords[4]))
        return A / B if B != 0 else 0
    except Exception as e:
        logger.error(f"Error calculating MAR: {str(e)}")
        logger.debug(traceback.format_exc())
        return 0

def calculate_pitch(landmarks):
    """Calculate head pitch (up/down rotation).
    Using nose tip (1) and chin (152) for more robust pitch estimation.
    A positive value generally means looking down, negative means looking up.
    """
    try:
        # Using normalized coordinates for pitch calculation
        nose_tip_y = landmarks.landmark[1].y
        chin_y = landmarks.landmark[152].y
        # A simple difference can indicate pitch. Adjust sensitivity as needed.
        return nose_tip_y - chin_y
    except Exception as e:
        logger.error(f"Error calculating pitch: {str(e)}")
        logger.debug(traceback.format_exc())
        return 0

def is_head_tilted(landmarks):
    """Check if head is tilted left or right (roll)."""
    try:
        # Using left (234) and right (454) temples or ears for roll detection
        # Increased threshold for less sensitivity
        return abs(landmarks.landmark[234].y - landmarks.landmark[454].y) > HEAD_TILT_THRESHOLD
    except Exception as e:
        logger.error(f"Error checking head tilt: {str(e)}")
        logger.debug(traceback.format_exc())
        return False

# --- Calibration and Smoothing Functions ---

def calibrate():
    """Calibrate neutral eye position for gaze detection."""
    logger.info("Calibrating facial emotion detection baseline...")
    global cap
    
    # Check if camera is available first
    if not check_camera_availability():
        logger.warning("Camera not available for calibration, using default values")
        return 0.5
    
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise Exception("Failed to open webcam during calibration.")
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        start_time = time.time()
        eye_samples = []
        frame_count = 0
        max_frames = 50  # Limit calibration frames
        
        while time.time() - start_time < 5 and STATE["running"] and frame_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                logger.debug("Failed to read frame during calibration, retrying...")
                time.sleep(0.2)  # Increased sleep to reduce camera conflicts
                continue
            
            frame_count += 1
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = face_mesh.process(rgb_frame)
            if result.multi_face_landmarks:
                for face_landmarks in result.multi_face_landmarks:
                    # Using the average Y of both eye centers for calibration
                    left_eye_center_y = face_landmarks.landmark[33].y
                    right_eye_center_y = face_landmarks.landmark[263].y
                    avg_eye_y = (left_eye_center_y + right_eye_center_y) / 2.0
                    eye_samples.append(avg_eye_y)
            time.sleep(0.1)  # Increased sleep for more stable calibration
        
        safe_camera_release()
        return np.mean(eye_samples) if eye_samples else 0.5
    except Exception as e:
        logger.error(f"Calibration error: {str(e)}")
        logger.debug(traceback.format_exc())
        safe_camera_release()
        return 0.5

def get_majority_emotion(history_deque):
    """Return the most frequent emotion in the history deque."""
    try:
        if not history_deque:
            return "Engaged"  # Default if no history
        counts = {}
        for emotion in history_deque:
            counts[emotion] = counts.get(emotion, 0) + 1
        return max(counts, key=counts.get)
    except Exception as e:
        logger.error(f"Error getting majority emotion: {str(e)}")
        logger.debug(traceback.format_exc())
        return "Engaged"

# --- Main Emotion Detection Loop ---

def facial_emotion_loop():
    """Core loop for facial emotion detection."""
    global cap
    try:
        calibrated_eye_y = calibrate()
        logger.info(f"Calibration complete. Calibrated Eye Y: {calibrated_eye_y:.3f}")
        
        # Check camera availability before starting main loop
        if not check_camera_availability():
            logger.warning("Camera not available, facial detection will use fallback values")
            while STATE["running"]:
                time.sleep(5)  # Sleep longer when camera unavailable
                if check_camera_availability():
                    break
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise Exception("Failed to open webcam for main detection loop.")
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        emotion_lock_time = 0
        gaze_away_counter = 0
        eyes_closed_start = None
        yawn_start = None
        no_face_start = None
        consecutive_failures = 0
        max_consecutive_failures = 10
        
        while STATE["running"]:
            try:
                ret, frame = cap.read()
                if not ret:
                    consecutive_failures += 1
                    if consecutive_failures > max_consecutive_failures:
                        logger.warning("Too many consecutive frame failures, checking camera availability")
                        if not check_camera_availability():
                            logger.warning("Camera not available, using fallback emotion")
                            time.sleep(5)  # Sleep longer when camera unavailable
                            continue
                        consecutive_failures = 0
                    else:
                        logger.debug("Failed to read frame from webcam, retrying...")
                        time.sleep(0.1)  # Reduced sleep time
                        continue

                consecutive_failures = 0  # Reset failure counter on success
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = face_mesh.process(rgb_frame)
                h, w, _ = frame.shape
                current_emotion = "Unknown"  # Default for this frame

                if results.multi_face_landmarks:
                    no_face_start = None;  # Reset no face timer
                    for face_landmarks in results.multi_face_landmarks:
                        left_eye_landmarks = [33, 160, 158, 133, 153, 144]
                        right_eye_landmarks = [362, 385, 387, 263, 373, 380]
                        mouth_landmarks = [61, 291, 0, 17, 405, 185, 13]

                        ear = (calculate_ear(left_eye_landmarks, face_landmarks, w, h) +
                               calculate_ear(right_eye_landmarks, face_landmarks, w, h)) / 2
                        mar = calculate_mar(mouth_landmarks, face_landmarks, w, h)
                        # Recalculate eye_y based on the current frame's landmarks
                        eye_y = (face_landmarks.landmark[33].y + face_landmarks.landmark[263].y) / 2.0
                        pitch = calculate_pitch(face_landmarks)

                        # --- Emotion Detection Logic (Prioritized) ---

                        # 1. Sleepy
                        if ear < EAR_THRESHOLD_SLEEPY:
                            if eyes_closed_start is None:
                                eyes_closed_start = time.time()
                            elif time.time() - eyes_closed_start > EYES_CLOSED_DURATION_SLEEPY:
                                current_emotion = "Sleepy"
                                # If sleepy, reset other counters
                                yawn_start = None
                                gaze_away_counter = 0
                        else:
                            eyes_closed_start = None  # Reset eyes closed timer

                        # 2. Bored (Yawning or Gaze Away)
                        if current_emotion != "Sleepy":  # Only check for bored if not already sleepy
                            if mar > MAR_THRESHOLD_YAWN:  # and pitch < PITCH_NEUTRAL_RANGE[1]: Removed pitch constraint for yawning, focus on mouth
                                if yawn_start is None:
                                    yawn_start = time.time()
                                elif time.time() - yawn_start > YAWN_DURATION_BORED:
                                    current_emotion = "Bored"
                                    eyes_closed_start = None  # Reset sleepy timer if bored by yawning
                            else:
                                yawn_start = None

                            # Gaze Away for Boredom
                            # Only if not already identified as sleepy or yawning
                            if current_emotion not in ["Sleepy", "Bored"]:
                                if abs(eye_y - calibrated_eye_y) > 0.07:  # Keeping original gaze deviation logic
                                    gaze_away_counter += 1
                                else:
                                    gaze_away_counter = max(0, gaze_away_counter - 2)  # Decays faster

                                if gaze_away_counter > GAZE_AWAY_THRESHOLD:
                                    current_emotion = "Bored"
                                    gaze_away_counter = 0  # Reset counter once bored is detected

                        # 3. Confused (Head Tilt)
                        if current_emotion not in ["Sleepy", "Bored"]:  # Check for confused if not sleepy or bored
                            if is_head_tilted(face_landmarks):
                                current_emotion = "Confused"
                                eyes_closed_start = None
                                yawn_start = None
                                gaze_away_counter = 0

                        # 4. DeepFace Emotions (Frustrated, Engaged) - Lower priority
                        # Only run DeepFace if no other strong emotion has been detected yet
                        if current_emotion == "Unknown":  # or current_emotion == "Engaged" (to allow override from Engaged)
                            try:
                                deepface_result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False, silent=True)
                                dom_emotion = deepface_result[0]['dominant_emotion']
                                emotion_probabilities = deepface_result[0]['emotion']

                                if (emotion_probabilities.get('angry', 0) > FRUSTRATION_PROB_THRESHOLD or
                                    emotion_probabilities.get('disgust', 0) > FRUSTRATION_PROB_THRESHOLD or
                                    dom_emotion in ['angry', 'disgust']):  # Stronger frustration condition
                                    current_emotion = "Frustrated"
                                elif dom_emotion in ['neutral', 'happy']:
                                    current_emotion = "Engaged"
                                elif dom_emotion in ['sad', 'fear']:  # Sad/Fear can also indicate confusion
                                    current_emotion = "Confused"
                                else:
                                    # If DeepFace detects something else but not strong enough for frustration/confusion,
                                    # or if it's "surprise" or "neutral" not meeting "engaged" criteria, keep it as unknown for now.
                                    pass  # Let smoothing handle it or default to engaged if no strong signal
                            except Exception as e:
                                # DeepFace can fail if face is not clear enough.
                                # In this case, we rely on non-DeepFace metrics or previous state.
                                logger.debug(f"DeepFace analysis error or no face detected by DeepFace: {str(e)}")
                                # If DeepFace fails, retain the last known robust emotion, or default to Engaged
                                current_emotion = STATE["last_emotion"] if STATE["last_emotion"] != "Unknown" else "Engaged"

                        # If still 'Unknown' after all checks, default to Engaged if conditions allow
                        if current_emotion == "Unknown":
                             # If no specific negative emotion, assume engaged, especially if pitch is neutral
                            if pitch >= PITCH_NEUTRAL_RANGE[0] and pitch <= PITCH_NEUTRAL_RANGE[1]:
                                current_emotion = "Engaged"
                            else:
                                # If head is not neutral, and no other specific emotion, keep previous or default to engaged
                                current_emotion = STATE["last_emotion"] if STATE["last_emotion"] != "Unknown" else "Engaged"

                        # Ensure "Engaged" overrides boredom if the person comes back into focus and is neutral/happy
                        # This rule is important for quick recovery from bored state
                        if STATE["last_emotion"] == "Bored" and current_emotion in ["Engaged", "Confused", "Frustrated"]:
                             # If they are no longer exhibiting bored characteristics, allow a quick switch
                            if current_emotion != "Bored":  # The previous logic was "dom_emotion in ['happy', 'neutral']" which is too narrow.
                                pass  # Let the determined current emotion stand

                        # --- State Update and Smoothing ---
                        STATE["emotion_history"].append(current_emotion)
                        smoothed_emotion = get_majority_emotion(STATE["emotion_history"])

                        now = time.time()
                        with STATE["lock"]:
                            # Apply EMOTION_LOCK_DURATION for stability
                            if smoothed_emotion != STATE["last_emotion"] and now - emotion_lock_time > EMOTION_LOCK_DURATION:
                                STATE["last_emotion"] = smoothed_emotion
                                emotion_lock_time = now
                                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                STATE["log_data"].append({"timestamp": timestamp, "emotion": STATE["last_emotion"], "source": "facial"})
                            elif smoothed_emotion == STATE["last_emotion"]:
                                # If emotion is stable, reset lock time to allow quick changes if a new strong emotion appears
                                emotion_lock_time = now

                else:  # No face detected
                    eyes_closed_start = None
                    yawn_start = None
                    gaze_away_counter = 0

                    if no_face_start is None:
                        no_face_start = time.time()
                    elif time.time() - no_face_start > NO_FACE_DURATION_BORED:
                        # After NO_FACE_DURATION_BORED, set to Bored if still no face
                        with STATE["lock"]:
                            if STATE["last_emotion"] != "Bored":
                                STATE["last_emotion"] = "Bored"
                                emotion_lock_time = time.time()
                                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                STATE["log_data"].append({"timestamp": timestamp, "emotion": "Bored", "source": "facial - no face (prolonged)"})
                    else:
                        # Immediately "Face Not Detected" if no face and not yet bored by duration
                        current_emotion = "Face Not Detected"
                        with STATE["lock"]:
                             # Allow immediate update for Face Not Detected
                            if STATE["last_emotion"] != "Face Not Detected":
                                STATE["last_emotion"] = "Face Not Detected"
                                emotion_lock_time = time.time()  # Reset lock for immediate state
                                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                STATE["log_data"].append({"timestamp": timestamp, "emotion": "Face Not Detected", "source": "facial - no face (instant)"})

                time.sleep(0.01)  # Small delay to prevent busy-waiting
            except Exception as e:
                logger.error(f"Error in facial emotion loop frame processing: {str(e)}")
                logger.debug(traceback.format_exc())
                time.sleep(0.1)  # Longer sleep on error to recover

    except Exception as e:
        logger.error(f"Fatal error in facial emotion detection loop: {str(e)}")
        logger.debug(traceback.format_exc())
    finally:
        safe_camera_release()
        try:
            face_mesh.close()
            logger.info("MediaPipe FaceMesh closed.")
        except Exception as e:
            logger.error(f"Error closing FaceMesh during cleanup: {str(e)}")

# --- Control Functions (kept as is) ---

def start_facial_emotion_detection():
    """Start facial emotion detection in a daemon thread."""
    try:
        with STATE["lock"]:
            if not STATE["running"]:
                STATE["running"] = True
                threading.Thread(target=facial_emotion_loop, daemon=True).start()
                logger.info("Facial emotion detection started successfully.")
                logger.info(f"DEBUG - STATE['running'] set to: {STATE['running']}")
            else:
                logger.info("Facial emotion detection is already running.")
                logger.info(f"DEBUG - STATE['running'] already: {STATE['running']}")
    except Exception as e:
        logger.error(f"Failed to start facial detection: {str(e)}")
        logger.debug(traceback.format_exc())
        with STATE["lock"]:
            STATE["running"] = False

def stop_facial_emotion_detection():
    """Stop facial emotion detection and save log data."""
    try:
        with STATE["lock"]:
            if STATE["running"]:
                STATE["running"] = False
                logger.info("Attempting to stop facial emotion detection...")
        time.sleep(0.5)  # Give a moment for the loop to naturally exit
        
        safe_camera_release()
        
        try:
            face_mesh.close()
            logger.info("MediaPipe FaceMesh closed during stop.")
        except Exception as e:
            logger.error(f"Error closing FaceMesh during stop: {str(e)}")
            
        if STATE["log_data"]:
            try:
                file_exists = os.path.exists("emotion_log.csv")
                pd.DataFrame(STATE["log_data"]).to_csv("emotion_log.csv", mode='a', index=False, header=not file_exists)
                logger.info(f"Emotion log saved to emotion_log.csv. Total entries: {len(STATE['log_data'])}.")
            except Exception as e:
                logger.error(f"Error saving facial log data: {str(e)}")
                logger.debug(traceback.format_exc())
            finally:
                # Clear log_data after saving to avoid duplicate entries on subsequent runs
                STATE["log_data"].clear()
        else:
            logger.info("No emotion data was collected to save.")
        logger.info("Facial emotion detection stopped.")
    except Exception as e:
        logger.error(f"Error stopping facial detection: {str(e)}")
        logger.debug(traceback.format_exc())

def get_facial_emotion():
    """Retrieve the current smoothed facial emotion."""
    try:
        with STATE["lock"]:
            current_emotion = STATE["last_emotion"]
            logger.info(f"DEBUG - Facial emotion detection running: {STATE['running']}")
            logger.info(f"DEBUG - Current facial emotion: {current_emotion}")
            return current_emotion
    except Exception as e:
        logger.error(f"Error getting facial emotion: {str(e)}")
        logger.debug(traceback.format_exc())
        return "Engaged"

# Example of how to run and stop for testing
if __name__ == "__main__":
    start_facial_emotion_detection()
    try:
        while True:
            current_face_emotion = get_facial_emotion()
            logger.info(f"Current Facial Emotion: {current_face_emotion}")
            time.sleep(1)  # Check emotion every second
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt detected. Stopping facial emotion detection.")
    finally:
        stop_facial_emotion_detection()