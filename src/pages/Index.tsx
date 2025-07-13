import { useState, useEffect, useRef } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EmotionTracker } from '@/components/EmotionTracker';
import { AIAssistant } from '@/components/AIAssistant';
import { ControlPanel } from '@/components/ControlPanel';
import { ProgressBadges } from '@/components/ProgressBadges';
import { MoodGraph } from '@/components/MoodGraph';
import BreathingExercise from '../components/BreathingExercise';

const Index = () => {
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isEmotionTriggered, setIsEmotionTriggered] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isBreathingExerciseOpen, setIsBreathingExerciseOpen] = useState(false);

  // Track last emotion to avoid duplicate popups
  const lastEmotionRef = useRef<string | null>(null);
  const assistantTriggeredRef = useRef<boolean>(false);

  // Handle emotion change from ControlPanel
  const handleEmotionChange = (emotion: string) => {
    console.log(`Index: Emotion changed to ${emotion}`);
    setCurrentEmotion(emotion);
    
    // Check if this is a new negative emotion that should trigger assistant
    const negativeEmotions = ['Confused', 'Frustrated', 'Sleepy', 'Bored'];
    const isNegativeEmotion = negativeEmotions.includes(emotion);
    const isNewEmotion = emotion !== lastEmotionRef.current;
    
    console.log(`Emotion analysis: negative=${isNegativeEmotion}, new=${isNewEmotion}, alreadyTriggered=${assistantTriggeredRef.current}`);
    
    if (isNegativeEmotion && isNewEmotion && !assistantTriggeredRef.current) {
      console.log(`Triggering AI assistant for emotion: ${emotion}`);
      assistantTriggeredRef.current = true;
      
      // Close any existing assistant first
      setIsAssistantOpen(false);
      setIsEmotionTriggered(false);
      
      // Show the popup by opening the assistant (it will show popup first)
      setTimeout(() => {
        setIsEmotionTriggered(true);
        setIsAssistantOpen(true);
        // Reset the trigger after a delay to allow for future triggers
        setTimeout(() => {
          assistantTriggeredRef.current = false;
          console.log("AI assistant trigger reset - ready for next negative emotion");
        }, 15000); // 15 seconds cooldown
      }, 1000); // 1 second delay before showing popup
    }
    
    lastEmotionRef.current = emotion;
  };

  // Map emotion string to emoji for display
  const mapEmotionToEmoji = (emotion: string | null) => {
    if (!emotion) return '😊';
    
    switch (emotion) {
      case 'Confused':
        return '🤔';
      case 'Frustrated':
        return '😫';
      case 'Sleepy':
        return '💤';
      case 'Bored':
        return '😐';
      case 'Engaged':
        return '🎯';
      case 'Happy':
        return '😊';
      case 'Unknown':
        return '❓';
      case 'Face Not Detected':
        return '👤';
      default:
        return '❓';
    }
  };

  // Reset assistant trigger when assistant is closed
  const handleAssistantClose = () => {
    setIsAssistantOpen(false);
    setIsEmotionTriggered(false);
    assistantTriggeredRef.current = false;
  };

  // Handle manual AI assistant button click (opens chat directly)
  const handleManualAssistantToggle = () => {
    setIsEmotionTriggered(false);
    setIsAssistantOpen(!isAssistantOpen);
    // Reset trigger when manually opened
    assistantTriggeredRef.current = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EmoLearn
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/60 rounded-2xl px-4 py-2">
                <span className="text-2xl">{mapEmotionToEmoji(currentEmotion)}</span>
                <span className="text-sm text-gray-600">
                  {currentEmotion || 'No Detection'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Video & Controls */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <VideoPlayer />
            
            {/* Control Panel */}
            <ControlPanel 
              isCameraOn={isCameraOn}
              setIsCameraOn={setIsCameraOn}
              isMicOn={isMicOn}
              setIsMicOn={setIsMicOn}
              onBreathingExercise={() => setIsBreathingExerciseOpen(true)}
              onAssistantToggle={handleManualAssistantToggle}
              onEmotionChange={handleEmotionChange}
            />

            {/* Emotion Tracker */}
            <EmotionTracker 
              currentEmotion={currentEmotion}
              isActive={isCameraOn || isMicOn}
            />

            {/* Mood Graph */}
            <MoodGraph />
          </div>

          {/* Right Column - Progress & Badges */}
          <div className="space-y-6">
            <ProgressBadges />
          </div>
        </div>
      </main>

      {/* AI Assistant Modal - Will show popup first */}
      <AIAssistant 
        isOpen={isAssistantOpen}
        onClose={handleAssistantClose}
        currentEmotion={mapEmotionToEmoji(currentEmotion)}
        isEmotionTriggered={isEmotionTriggered}
      />

      {/* Breathing Exercise Modal */}
      <BreathingExercise 
        isOpen={isBreathingExerciseOpen}
        onClose={() => setIsBreathingExerciseOpen(false)}
      />
    </div>
  );
};

export default Index;
