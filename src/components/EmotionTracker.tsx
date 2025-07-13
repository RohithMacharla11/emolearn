import { Card } from '@/components/ui/card';

interface EmotionTrackerProps {
  currentEmotion: string | null;
  isActive: boolean;
}

export const EmotionTracker = ({ currentEmotion, isActive }: EmotionTrackerProps) => {
  const emotions = [
    { emoji: '😊', label: 'Happy', color: 'from-green-400 to-emerald-500', value: 'Happy' },
    { emoji: '🤔', label: 'Confused', color: 'from-yellow-400 to-orange-500', value: 'Confused' },
    { emoji: '😫', label: 'Frustrated', color: 'from-red-400 to-red-500', value: 'Frustrated' },
    { emoji: '💤', label: 'Sleepy', color: 'from-blue-400 to-indigo-500', value: 'Sleepy' },
    { emoji: '😐', label: 'Bored', color: 'from-gray-400 to-gray-500', value: 'Bored' },
    { emoji: '🎯', label: 'Engaged', color: 'from-purple-400 to-purple-500', value: 'Engaged' },
  ];

  // Map emotion string to emoji
  const getEmotionEmoji = (emotion: string) => {
    const emotionMap: { [key: string]: string } = {
      'Happy': '😊',
      'Confused': '🤔', 
      'Frustrated': '😫',
      'Sleepy': '💤',
      'Bored': '😐',
      'Engaged': '🎯',
      'Unknown': '❓'
    };
    return emotionMap[emotion] || '❓';
  };

  const currentEmotionEmoji = currentEmotion ? getEmotionEmoji(currentEmotion) : '❓';

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Emotion Detection</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">{isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        
        {/* Current Emotion Display */}
        {currentEmotion && (
          <div className="text-center p-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl text-white shadow-lg">
            <div className="text-4xl mb-2">{currentEmotionEmoji}</div>
            <div className="text-lg font-semibold">{currentEmotion}</div>
            <div className="text-sm opacity-90">Current Mood</div>
          </div>
        )}
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {emotions.map((emotion) => (
            <div
              key={emotion.emoji}
              className={`text-center p-3 rounded-xl transition-all duration-300 ${
                currentEmotion === emotion.value
                  ? `bg-gradient-to-br ${emotion.color} text-white shadow-lg scale-105`
                  : 'bg-gray-100/50 hover:bg-gray-200/50'
              }`}
            >
              <div className="text-2xl mb-1">{emotion.emoji}</div>
              <div className={`text-xs font-medium ${
                currentEmotion === emotion.value ? 'text-white' : 'text-gray-600'
              }`}>
                {emotion.label}
              </div>
            </div>
          ))}
        </div>
        
        {!isActive && !currentEmotion && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Enable camera or microphone to start emotion detection</p>
          </div>
        )}
      </div>
    </Card>
  );
};
