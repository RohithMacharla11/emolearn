import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Coffee,
  MessageCircle,
  BookOpen,
  Timer,
  Bell,
  BellOff,
  Target,
} from "lucide-react";

import "./voice.css"; // Optional styling for voice UI

interface ControlPanelProps {
  isCameraOn: boolean;
  setIsCameraOn: (value: boolean) => void;
  isMicOn: boolean;
  setIsMicOn: (value: boolean) => void;
  onBreathingExercise: () => void;
  onAssistantToggle: () => void;
  onEmotionChange: (emotion: string) => void; // New prop to pass emotion to parent
}

export const ControlPanel = ({
  isCameraOn,
  setIsCameraOn,
  isMicOn,
  setIsMicOn,
  onBreathingExercise,
  onAssistantToggle,
  onEmotionChange,
}: ControlPanelProps) => {
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [lastEmotion, setLastEmotion] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [dndMode, setDndMode] = useState(false);
  const [focusTimer, setFocusTimer] = useState<number | null>(null);
  const [dndTimer, setDndTimer] = useState<number | null>(null);
  const [showDndDialog, setShowDndDialog] = useState(false);
  const [dndMinutes, setDndMinutes] = useState(30);

  // Function to notify backend about sensor state changes
  const notifyBackendSensorChange = async (sensorType: 'camera' | 'microphone', enabled: boolean) => {
    try {
      const endpoint = sensorType === 'camera' ? '/api/sensors/camera' : '/api/sensors/microphone';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Backend ${sensorType} state updated:`, data);
      }
    } catch (error) {
      console.error(`Failed to notify backend about ${sensorType} state:`, error);
    }
  };

  const handleMicToggle = () => {
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    setShowVoiceInput(newMicState);
    
    // Notify backend about microphone state change
    notifyBackendSensorChange('microphone', newMicState);
  };

  const handleCameraToggle = () => {
    const newCameraState = !isCameraOn;
    
    // Don't access camera directly from frontend - let backend handle it
    setIsCameraOn(newCameraState);
    
    // Notify backend about camera state change
    notifyBackendSensorChange('camera', newCameraState);
  };

  const handleVoiceResult = (text: string) => {
    console.log("Recognized speech:", text);
  };

  const handleAssistantClick = () => {
    setShowAssistant((prev) => !prev);
    onAssistantToggle();
  };

  // Quiz Me functionality - opens AI Assistant with quiz mode
  const handleQuizMe = () => {
    // Open AI Assistant and trigger quiz mode
    onAssistantToggle();
    // You can add a prop to pass quiz mode to the assistant
    console.log("Opening AI Assistant in Quiz Mode");
  };

  // Focus Mode functionality
  const handleFocusMode = () => {
    if (focusMode) {
      // Turn off focus mode
      setFocusMode(false);
      setFocusTimer(null);
      console.log("Focus mode turned off");
    } else {
      // Turn on focus mode for 25 minutes (Pomodoro technique)
      setFocusMode(true);
      setFocusTimer(25 * 60); // 25 minutes in seconds
      console.log("Focus mode activated for 25 minutes");
      
      // Start countdown
      const interval = setInterval(() => {
        setFocusTimer((prev) => {
          if (prev && prev > 0) {
            return prev - 1;
          } else {
            setFocusMode(false);
            clearInterval(interval);
            console.log("Focus session completed!");
            return null;
          }
        });
      }, 1000);
    }
  };

  // Don't Disturb functionality
  const handleDndMode = () => {
    if (dndMode) {
      // Turn off DND mode
      setDndMode(false);
      setDndTimer(null);
      console.log("Don't Disturb mode turned off");
    } else {
      // Show dialog to select minutes
      setShowDndDialog(true);
    }
  };

  // Start DND timer
  const startDndTimer = (minutes: number) => {
    setDndMode(true);
    setDndTimer(minutes * 60); // Convert to seconds
    setShowDndDialog(false);
    console.log(`Don't Disturb mode activated for ${minutes} minutes`);
    
    // Start countdown
    const interval = setInterval(() => {
      setDndTimer((prev) => {
        if (prev && prev > 0) {
          return prev - 1;
        } else {
          setDndMode(false);
          clearInterval(interval);
          console.log("Don't Disturb mode ended!");
          return null;
        }
      });
    }, 1000);
  };

  // Format timer display
  const formatTimer = (seconds: number | null) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to get emotion based on current state
  const getEmotionBasedOnState = async () => {
    try {
      let endpoint = "";
      
      if (!isCameraOn && !isMicOn) {
        // Both off - use interaction emotion
        endpoint = "/api/emotion/interaction";
      } else if (isCameraOn && !isMicOn) {
        // Only camera on - use facial emotion
        endpoint = "/api/emotion/facial";
      } else if (!isCameraOn && isMicOn) {
        // Only mic on - use voice emotion
        endpoint = "/api/emotion/voice";
      } else {
        // Both on - use combined emotion
        endpoint = "/api/emotion/combined";
      }

      const res = await fetch(`http://localhost:8000${endpoint}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const detectedEmotion = data.emotion || "Unknown";
      
      console.log(`Fetched emotion from ${endpoint}:`, detectedEmotion);
      
      // Only update if emotion has changed
      if (detectedEmotion !== lastEmotion) {
        setEmotion(detectedEmotion);
        setLastEmotion(detectedEmotion);
        onEmotionChange(detectedEmotion); // Pass to parent component
        
        console.log(`Emotion changed: ${detectedEmotion} (${endpoint})`);
      }
      
      return detectedEmotion;
    } catch (error) {
      console.error("Emotion fetch failed:", error);
      
      // Try to get latest emotion from JSON file as fallback
      try {
        const jsonRes = await fetch('http://localhost:8000/api/emotion/latest');
        if (jsonRes.ok) {
          const jsonData = await jsonRes.json();
          const fallbackEmotion = jsonData.final_emotion || "Unknown";
          console.log("Using fallback emotion from JSON:", fallbackEmotion);
          
          if (fallbackEmotion !== lastEmotion) {
            setEmotion(fallbackEmotion);
            setLastEmotion(fallbackEmotion);
            onEmotionChange(fallbackEmotion);
          }
          return fallbackEmotion;
        }
      } catch (jsonError) {
        console.error("JSON fallback also failed:", jsonError);
      }
      
      const fallbackEmotion = "Unknown";
      if (fallbackEmotion !== lastEmotion) {
        setEmotion(fallbackEmotion);
        setLastEmotion(fallbackEmotion);
        onEmotionChange(fallbackEmotion);
      }
      return fallbackEmotion;
    }
  };

  // Poll emotion from backend based on current state
  useEffect(() => {
    // Only poll if at least one sensor is enabled
    if (!isCameraOn && !isMicOn) {
      console.log("No sensors enabled, skipping emotion polling");
      return;
    }

    const fetchEmotion = async () => {
      await getEmotionBasedOnState();
    };

    // Initial fetch
    fetchEmotion();
    
    // Set up polling interval
    const interval = setInterval(fetchEmotion, 2000); // Poll every 2 seconds for more responsive updates

    return () => clearInterval(interval);
  }, [isCameraOn, isMicOn]); // Re-run when camera or mic state changes

  // Function to check backend status
  const checkBackendStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/sensors/status');
      if (res.ok) {
        const status = await res.json();
        console.log('Backend status:', status);
        return status;
      }
    } catch (error) {
      console.error('Failed to check backend status:', error);
    }
    return null;
  };

  // Check backend status when sensors are toggled
  useEffect(() => {
    if (isCameraOn || isMicOn) {
      checkBackendStatus();
    }
  }, [isCameraOn, isMicOn]);

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Learning Controls</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Camera Toggle */}
          <Button
            variant={isCameraOn ? "default" : "outline"}
            className={`flex flex-col items-center space-y-2 h-20 ${
              isCameraOn
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                : "border-2 border-gray-200 hover:border-blue-300"
            }`}
            onClick={handleCameraToggle}
          >
            {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            <span className="text-xs">Camera</span>
          </Button>

          {/* Mic Toggle */}
          <Button
            variant={isMicOn ? "default" : "outline"}
            className={`flex flex-col items-center space-y-2 h-20 ${
              isMicOn
                ? "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                : "border-2 border-gray-200 hover:border-green-300"
            }`}
            onClick={handleMicToggle}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            <span className="text-xs">Microphone</span>
          </Button>

          {/* Break Timer */}
          <Button
            variant="outline"
            className="flex flex-col items-center space-y-2 h-20 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
            onClick={onBreathingExercise}
          >
            <Coffee className="w-5 h-5 text-orange-500" />
            <span className="text-xs">Take Break</span>
          </Button>

          {/* AI Assistant */}
          <Button
            variant="outline"
            className="flex flex-col items-center space-y-2 h-20 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
            onClick={handleAssistantClick}
          >
            <MessageCircle className="w-5 h-5 text-purple-500" />
            <span className="text-xs">AI Help</span>
          </Button>
        </div>

        {/* Camera Status Indicator */}
        {isCameraOn && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg shadow text-sm font-medium text-gray-800">
            📹 <strong>Camera Status:</strong> Active (Backend Processing)
            <div className="text-xs text-gray-600 mt-1">
              Camera is being used by the emotion detection system
            </div>
          </div>
        )}

        {/* Current Emotion */}
        {emotion && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg shadow text-sm font-medium text-gray-800">
            🎭 <strong>Current Mood:</strong> {emotion}
            <div className="text-xs text-gray-600 mt-1">
              {!isCameraOn && !isMicOn && "Based on interaction"}
              {isCameraOn && !isMicOn && "Based on facial detection"}
              {!isCameraOn && isMicOn && "Based on voice detection"}
              {isCameraOn && isMicOn && "Based on combined detection"}
            </div>
            <div className="text-xs text-green-600 mt-1">
              ✓ Live emotion detection active
            </div>
          </div>
        )}

        {/* Status when no emotion detected */}
        {!emotion && (isCameraOn || isMicOn) && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg shadow text-sm font-medium text-gray-800">
            🔄 <strong>Status:</strong> Initializing emotion detection...
            <div className="text-xs text-gray-600 mt-1">
              {isCameraOn && "Camera active"}
              {isMicOn && "Microphone active"}
            </div>
          </div>
        )}

        {/* Focus Mode Status */}
        {focusMode && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg shadow text-sm font-medium text-gray-800">
            🎯 <strong>Focus Mode:</strong> Active {focusTimer && `(${formatTimer(focusTimer)})`}
            <div className="text-xs text-gray-600 mt-1">
              Stay focused on your current task
            </div>
          </div>
        )}

        {/* Don't Disturb Status */}
        {dndMode && (
          <div className="mt-4 p-3 bg-red-100 rounded-lg shadow text-sm font-medium text-gray-800">
            🔕 <strong>Don't Disturb:</strong> Active {dndTimer && `(${formatTimer(dndTimer)})`}
            <div className="text-xs text-gray-600 mt-1">
              AI Assistant will not interrupt you
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <Button 
            size="sm" 
            variant="outline" 
            className="hover:bg-blue-50 hover:border-blue-300"
            onClick={handleQuizMe}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Quiz Me
          </Button>
          <Button 
            size="sm" 
            variant={focusMode ? "default" : "outline"} 
            className={focusMode ? "bg-green-500 hover:bg-green-600" : "hover:bg-green-50 hover:border-green-300"}
            onClick={handleFocusMode}
          >
            <Target className="w-4 h-4 mr-2" />
            Focus Mode {focusTimer && `(${formatTimer(focusTimer)})`}
          </Button>
          <Button 
            size="sm" 
            variant={dndMode ? "default" : "outline"} 
            className={dndMode ? "bg-red-500 hover:bg-red-600" : "hover:bg-red-50 hover:border-red-300"}
            onClick={handleDndMode}
          >
            {dndMode ? <BellOff className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
            Don't Disturb {dndTimer && `(${formatTimer(dndTimer)})`}
          </Button>
        </div>

        {/* Don't Disturb Dialog */}
        {showDndDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Set Don't Disturb Timer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minutes:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={dndMinutes}
                    onChange={(e) => setDndMinutes(parseInt(e.target.value) || 30)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => startDndTimer(dndMinutes)}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    Start Timer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDndDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
