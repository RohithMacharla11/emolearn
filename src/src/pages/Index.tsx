
import { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EmotionTracker } from '@/components/EmotionTracker';
import { AIAssistant } from '@/components/AIAssistant';
import { ControlPanel } from '@/components/ControlPanel';
import { ProgressBadges } from '@/components/ProgressBadges';
import { MoodGraph } from '@/components/MoodGraph';
import { BreathingExercise } from '@/components/BreathingExercise';

const Index = () => {
  const [currentEmotion, setCurrentEmotion] = useState('😊');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isBreathingExerciseOpen, setIsBreathingExerciseOpen] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState([
    { time: '10:00', emotion: '😊', value: 0.8 },
    { time: '10:05', emotion: '🤔', value: 0.4 },
    { time: '10:10', emotion: '😊', value: 0.7 },
    { time: '10:15', emotion: '😫', value: 0.2 },
    { time: '10:20', emotion: '😊', value: 0.9 },
  ]);

  // Simulate emotion detection
  useEffect(() => {
    const emotions = ['😊', '🤔', '😫', '💤', '😐'];
    const interval = setInterval(() => {
      if (isCameraOn) {
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setCurrentEmotion(randomEmotion);
        
        // Trigger assistant for certain emotions
        if ((randomEmotion === '🤔' || randomEmotion === '😫') && !isAssistantOpen) {
          setTimeout(() => setIsAssistantOpen(true), 2000);
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isCameraOn, isAssistantOpen]);

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
                <span className="text-2xl">{currentEmotion}</span>
                <span className="text-sm text-gray-600">Current Mood</span>
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
              onAssistantToggle={() => setIsAssistantOpen(!isAssistantOpen)}
            />

            {/* Emotion Tracker */}
            <EmotionTracker 
              currentEmotion={currentEmotion}
              isActive={isCameraOn}
            />

            {/* Mood Graph */}
            <MoodGraph data={emotionHistory} />
          </div>

          {/* Right Column - Progress & Badges */}
          <div className="space-y-6">
            <ProgressBadges />
          </div>
        </div>
      </main>

      {/* AI Assistant Modal */}
      <AIAssistant 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        currentEmotion={currentEmotion}
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
