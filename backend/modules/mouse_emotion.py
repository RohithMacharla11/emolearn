import time
import threading
import logging
from collections import deque
import pandas as pd
from datetime import datetime
import os
import numpy as np # For calculating mean/std dev for movement
import traceback # Ensure traceback is imported

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Configuration Constants for Tuning ---
# These thresholds can be adjusted based on testing with target users (students)
# for optimal emotion detection.

# Click Rate (clicks per second over a window)
# Aggressive, rapid clicks indicating frustration
FRUSTRATED_CLICK_RATE_THRESHOLD = 3.5
# Normal engagement click rate range
ENGAGED_MIN_CLICK_RATE = 0.1
ENGAGED_MAX_CLICK_RATE = 2.5

# Hover Duration (average seconds)
# Significantly longer hover duration for genuine confusion/doubt
CONFUSED_HOVER_DURATION_THRESHOLD = 3.0
# Very short hovers often accompany frustration (impatient)
FRUSTRATED_MAX_HOVER_DURATION = 0.4

# Idle Time (seconds since last activity)
BORED_IDLE_THRESHOLD = 15.0
SLEEPY_IDLE_THRESHOLD = 60.0

# Mouse Movement (pixels per second)
# High speed, erratic movements for frustration
FRUSTRATED_MIN_MOVEMENT_SPEED = 250
# Normal movement speed for engagement
ENGAGED_MIN_MOVEMENT_SPEED = 30
ENGAGED_MAX_MOVEMENT_SPEED = 200
# Very low movement speed (but not idle) for boredom/lack of interaction
BORED_MAX_MOVEMENT_SPEED = 25

# Combined Activity Threshold for Frustration
# High click rate AND high movement speed over short period
FRUSTRATED_MIN_COMBINED_ACTIVITY_SCORE = 0.8 # Score combines normalized click rate and movement speed

# Smoothing
EMOTION_HISTORY_LENGTH = 15 # Number of recent frames to consider for majority emotion
MOUSE_METRIC_HISTORY_LENGTH = 20 # Number of recent samples for movement metrics

# --- Shared State ---
# This dictionary holds the real-time state of the mouse interaction system.
STATE = {
    "running": False, # Flag to control the main detection loop
    "last_emotion": "Engaged", # Stores the last detected and smoothed emotion
    "click_times": deque(maxlen=MOUSE_METRIC_HISTORY_LENGTH), # Timestamps of clicks
    "hover_start_time": None, # Timestamp when a hover started
    "hover_durations": deque(maxlen=MOUSE_METRIC_HISTORY_LENGTH), # Durations of individual hovers
    "last_mouse_x": None, # Last known mouse X coordinate for movement tracking
    "last_mouse_y": None, # Last known mouse Y coordinate for movement tracking
    "last_move_time": None, # Timestamp of the last mouse movement
    "movement_distances": deque(maxlen=MOUSE_METRIC_HISTORY_LENGTH), # Distances moved per short interval
    "movement_speeds": deque(maxlen=MOUSE_METRIC_HISTORY_LENGTH), # Calculated speeds per short interval
    "last_activity_time": time.time(), # Overall last activity (click or move)
    "emotion_history": deque(maxlen=EMOTION_HISTORY_LENGTH), # History of classified emotions for smoothing
    "lock": threading.Lock(), # A lock for thread-safe access to shared state variables
}

# --- Emotion Classification Logic ---

def classify_mouse_emotion(click_rate, avg_hover_duration, idle_time, avg_movement_speed, movement_variability):
    """
    Classifies the user's emotion based on combined mouse interaction metrics,
    prioritizing Frustrated, then Bored/Sleepy, then Confused, and finally Engaged.
    """
    # 1. Prioritize Bored/Sleepy for long periods of inactivity
    if idle_time > SLEEPY_IDLE_THRESHOLD:
        return "Sleepy"
    elif idle_time > BORED_IDLE_THRESHOLD:
        return "Bored"

    # 2. Prioritize Frustrated for aggressive/impatient interactions
    # Normalize click_rate and movement_speed for a combined score (max 1.0 each)
    normalized_click_rate = min(click_rate / FRUSTRATED_CLICK_RATE_THRESHOLD, 1.0)
    normalized_movement_speed = min(avg_movement_speed / FRUSTRATED_MIN_MOVEMENT_SPEED, 1.0)
    
    combined_frustration_score = (normalized_click_rate + normalized_movement_speed) / 2 # Average their contribution

    if (combined_frustration_score >= FRUSTRATED_MIN_COMBINED_ACTIVITY_SCORE and 
        avg_hover_duration < FRUSTRATED_MAX_HOVER_DURATION):
        return "Frustrated"
    # Individual high thresholds can also trigger frustration
    if click_rate >= FRUSTRATED_CLICK_RATE_THRESHOLD * 1.2 or avg_movement_speed >= FRUSTRATED_MIN_MOVEMENT_SPEED * 1.2:
        return "Frustrated"


    # 3. Prioritize Confused for significant, deliberate hovering (rare cases)
    # Average hover duration must be significantly high, indicating doubt/searching
    if avg_hover_duration >= CONFUSED_HOVER_DURATION_THRESHOLD:
        # Ensure it's not also strongly frustrated (low click rate, moderate movement)
        if click_rate < FRUSTRATED_CLICK_RATE_THRESHOLD * 0.5 and avg_movement_speed < FRUSTRATED_MIN_MOVEMENT_SPEED * 0.5:
            return "Confused"

    # 4. Bored (if not idle, but very low activity)
    # Mouse is moving, but very slowly, and few clicks
    if avg_movement_speed <= BORED_MAX_MOVEMENT_SPEED and click_rate < ENGAGED_MIN_CLICK_RATE:
        return "Bored"

    # 5. Engaged (the default for normal, purposeful interaction)
    # Moderate click rate, purposeful movement, not idle
    if (ENGAGED_MIN_CLICK_RATE <= click_rate <= ENGAGED_MAX_CLICK_RATE or
        ENGAGED_MIN_MOVEMENT_SPEED <= avg_movement_speed <= ENGAGED_MAX_MOVEMENT_SPEED):
        return "Engaged"
    
    # Fallback to Engaged if no other strong pattern is detected (e.g., minimal background activity)
    return "Engaged"

# --- Logging Function ---

def log_emotion(emotion, source="mouse"):
    """
    Logs the detected emotion to the console and appends it to a CSV file.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = {
        "timestamp": timestamp,
        "emotion": emotion,
        "source": source
    }
    logger.info(f"Logged emotion: {emotion} (Source: {source})")
    
    try:
        # Check if file exists to determine if header is needed
        file_exists = os.path.exists("emotion_log.csv")
        df = pd.DataFrame([log_entry])
        df.to_csv("emotion_log.csv", mode='a', index=False, header=not file_exists)
    except Exception as e:
        logger.error(f"Error writing to log file: {str(e)}")
        logger.error(traceback.format_exc())

# --- Smoothing Function ---
def get_majority_emotion(history_deque):
    """
    Analyzes a deque of recent emotions and returns the most frequently occurring emotion.
    This helps in smoothing out rapid emotion changes.
    """
    if not history_deque:
        return "Engaged" # Default if history is empty

    counts = {}
    for emotion in history_deque:
        counts[emotion] = counts.get(emotion, 0) + 1
        
    return max(counts, key=counts.get) # Return the emotion with the highest count

# --- Main Mouse Emotion Detection Loop ---

def mouse_emotion_loop():
    """
    The main loop that continuously processes mouse activity metrics
    and classifies the user's emotion. This function runs in a separate thread.
    """
    
    while STATE["running"]:
        try:
            current_time = time.time()
            
            # --- Acquire metrics from shared state ---
            with STATE["lock"]:
                # Click rate calculation (consider clicks within the last 5 seconds)
                recent_clicks = [t for t in STATE["click_times"] if t > current_time - 5]
                # Calculate time window based on the spread of recent clicks
                time_window_clicks = current_time - (recent_clicks[0] if recent_clicks else current_time)
                click_rate = len(recent_clicks) / time_window_clicks if time_window_clicks > 0 else 0

                # Average hover duration
                avg_hover_duration = np.mean(list(STATE["hover_durations"])) if STATE["hover_durations"] else 0

                # Movement speed calculation (average over recent movements)
                avg_movement_speed = np.mean(list(STATE["movement_speeds"])) if STATE["movement_speeds"] else 0
                movement_variability = np.std(list(STATE["movement_speeds"])) if len(STATE["movement_speeds"]) > 1 else 0

                # Idle time calculation
                idle_time = current_time - STATE["last_activity_time"]
            
            # --- Classify emotion ---
            current_emotion = classify_mouse_emotion(
                click_rate, avg_hover_duration, idle_time, avg_movement_speed, movement_variability
            )

            # --- Smooth and update global emotion state ---
            with STATE["lock"]:
                STATE["emotion_history"].append(current_emotion)
                smoothed_emotion = get_majority_emotion(STATE["emotion_history"])

                if smoothed_emotion != STATE["last_emotion"]:
                    STATE["last_emotion"] = smoothed_emotion
                    log_emotion(smoothed_emotion, source="mouse")

            time.sleep(0.5) # Process metrics every 0.5 seconds
            
        except Exception as e:
            logger.error(f"Error in mouse emotion loop: {str(e)}")
            logger.error(traceback.format_exc())
            time.sleep(1) # Wait longer on error to prevent rapid error looping

# --- Control Functions ---

def start_mouse_emotion_detection():
    """
    Starts the mouse emotion detection loop in a new daemon thread.
    """
    with STATE["lock"]:
        if not STATE["running"]:
            STATE["running"] = True
            threading.Thread(target=mouse_emotion_loop, daemon=True).start()
            logger.info("Mouse emotion detection started.")
        else:
            logger.info("Mouse emotion detection is already running.")

def stop_mouse_emotion_detection():
    """
    Stops the mouse emotion detection thread.
    """
    with STATE["lock"]:
        if STATE["running"]:
            STATE["running"] = False
            logger.info("Stopping mouse emotion detection...")
    time.sleep(0.6) # Give the loop a moment to recognize the stop signal
    logger.info("Mouse emotion detection stopped.")

def get_mouse_emotion():
    """
    Retrieves the current smoothed mouse-based emotion.
    """
    with STATE["lock"]:
        return STATE["last_emotion"]

# --- Functions to Feed Mouse Activity (Simulated for this standalone script) ---

def update_mouse_activity(activity_type, x=None, y=None, duration=0):
    """
    Call this function from your application's mouse event handlers
    to feed real-time mouse activity into the system.

    Parameters:
        activity_type (str): 'click', 'hover_start', 'hover_end', 'move'
        x (int, optional): Mouse X coordinate for 'move' events.
        y (int, optional): Mouse Y coordinate for 'move' events.
        duration (float, optional): Duration for 'hover_end' events.
    """
    with STATE["lock"]:
        current_time = time.time()
        STATE["last_activity_time"] = current_time # Update last activity for any event

        if activity_type == 'click':
            STATE["click_times"].append(current_time)
            logger.debug("Mouse click recorded") # Use debug for frequent events

        elif activity_type == 'hover_start':
            STATE["hover_start_time"] = current_time
            logger.debug("Hover started")

        elif activity_type == 'hover_end':
            if STATE["hover_start_time"] is not None:
                hover_duration = current_time - STATE["hover_start_time"]
                STATE["hover_durations"].append(hover_duration)
                STATE["hover_start_time"] = None # Reset
                logger.debug(f"Hover ended, duration: {hover_duration:.2f}s")

        elif activity_type == 'move':
            if STATE["last_mouse_x"] is not None and STATE["last_mouse_y"] is not None and STATE["last_move_time"] is not None:
                dx = x - STATE["last_mouse_x"]
                dy = y - STATE["last_mouse_y"]
                distance = np.sqrt(dx**2 + dy**2)
                time_delta = current_time - STATE["last_move_time"]
                
                if time_delta > 0: # Avoid division by zero
                    speed = distance / time_delta
                    STATE["movement_distances"].append(speed) # Store speed directly
                    # Note: We don't need to store movement_distances as a separate metric for classification
                    # Speed is already a derived metric for that.
                    logger.debug(f"Mouse moved, speed: {speed:.2f} px/s")

            STATE["last_mouse_x"] = x
            STATE["last_mouse_y"] = y
            STATE["last_move_time"] = current_time
        else:
            logger.warning(f"Unknown mouse activity type: {activity_type}")

# --- Example Usage (How to integrate and test) ---
# This block simulates mouse events to demonstrate the functionality.
# In a real application, you would replace these `simulate_mouse_...` calls
# with actual event listeners from your GUI or web environment.

if __name__ == "__main__":
    import random # For simulating erratic movements

    print("Starting mouse emotion detection...")
    start_mouse_emotion_detection()

    # Simulate some initial mouse position
    update_mouse_activity('move', x=0, y=0)

    print("\n--- Simulating User Behavior ---")
    
    print("\nSimulating 'Engaged' behavior (moderate clicks, movements)...")
    for _ in range(10):
        update_mouse_activity('click')
        update_mouse_activity('move', x=random.randint(50, 100), y=random.randint(50, 100))
        time.sleep(0.5)
    print(f"Current Mouse Emotion: {get_mouse_emotion()}") # Should be Engaged

    print("\nSimulating 'Frustrated' behavior (rapid clicks AND jerky moves)...")
    # Simulate an intense burst of activity
    for i in range(15): # More actions over a shorter period
        update_mouse_activity('click')
        # Simulate very fast, large, erratic movements
        update_mouse_activity('move', x=random.randint(400, 700), y=random.randint(400, 700)) 
        time.sleep(0.08) # Very fast interval
    print(f"Current Mouse Emotion: {get_mouse_emotion()}") # Should clearly transition to Frustrated

    print("\nSimulating 'Confused' behavior (long, deliberate hovers)...")
    # This should be harder to trigger now
    for _ in range(3): # Fewer instances to show it's rarer
        update_mouse_activity('hover_start')
        # Ensure it's above threshold and long enough to register
        time.sleep(random.uniform(CONFUSED_HOVER_DURATION_THRESHOLD + 0.5, CONFUSED_HOVER_DURATION_THRESHOLD + 1.5)) 
        update_mouse_activity('hover_end') # Duration will be calculated internally
        # Simulate small, slow moves during/after hover to signify deliberate thought
        update_mouse_activity('move', x=random.randint(10, 20), y=random.randint(10, 20)) 
        time.sleep(0.5)
    print(f"Current Mouse Emotion: {get_mouse_emotion()}") # Should transition to Confused, but only if hover is significant

    print("\nSimulating 'Bored' behavior (long idle, occasional very slow move)...")
    time.sleep(BORED_IDLE_THRESHOLD + 5) # Idle time
    update_mouse_activity('move', x=10, y=10) # Small, slow move to reset idle but still show low activity
    time.sleep(2)
    print(f"Current Mouse Emotion: {get_mouse_emotion()}") # Should transition to Bored

    print("\nSimulating 'Sleepy' behavior (very long idle)...")
    time.sleep(SLEEPY_IDLE_THRESHOLD + 5) # Very long idle
    print(f"Current Mouse Emotion: {get_mouse_emotion()}") # Should transition to Sleepy

    # You can also manually stop it with Ctrl+C if testing continuously
    try:
        print("\nMonitoring for 10 more seconds (press Ctrl+C to stop early)...")
        for i in range(10):
            print(f"Time remaining: {10 - i}s. Current Mouse Emotion: {get_mouse_emotion()}")
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        print("\nStopping mouse emotion detection...")
        stop_mouse_emotion_detection()
        print("Application exited.")

# if __name__ == "__main__":
#     import random

#     print("🖱️ Starting Mouse Emotion Detection...")
#     start_mouse_emotion_detection()

#     try:
#         for _ in range(30):  # Simulate 30 seconds
#             update_mouse_activity('click')
#             update_mouse_activity('move', x=random.randint(100, 500), y=random.randint(100, 500))
#             time.sleep(1)
#             print(f"[Mouse Emotion]: {get_mouse_emotion()}")
#     except KeyboardInterrupt:
#         pass
#     finally:
#         stop_mouse_emotion_detection()
#         print("🛑 Mouse detection stopped.")
