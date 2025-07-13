
import { Card } from '@/components/ui/card';

interface EmotionTrackerProps {
  currentEmotion: string;
  isActive: boolean;
}

export const EmotionTracker = ({ currentEmotion, isActive }: EmotionTrackerProps) => {
  const emotions = [
    { emoji: '😊', label: 'Happy', color: 'from-green-400 to-emerald-500' },
    { emoji: '🤔', label: 'Confused', color: 'from-yellow-400 to-orange-500' },
    { emoji: '😫', label: 'Frustrated', color: 'from-red-400 to-red-500' },
    { emoji: '💤', label: 'Drowsy', color: 'from-blue-400 to-indigo-500' },
    { emoji: '😐', label: 'Bored', color: 'from-gray-400 to-gray-500' },
  ];

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
        
        <div className="grid grid-cols-5 gap-4">
          {emotions.map((emotion) => (
            <div
              key={emotion.emoji}
              className={`text-center p-4 rounded-2xl transition-all duration-300 ${
                currentEmotion === emotion.emoji
                  ? `bg-gradient-to-br ${emotion.color} text-white shadow-lg scale-110`
                  : 'bg-gray-100/50 hover:bg-gray-200/50'
              }`}
            >
              <div className="text-3xl mb-2">{emotion.emoji}</div>
              <div className={`text-xs font-medium ${
                currentEmotion === emotion.emoji ? 'text-white' : 'text-gray-600'
              }`}>
                {emotion.label}
              </div>
            </div>
          ))}
        </div>
        
        {!isActive && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Enable camera to start emotion detection</p>
          </div>
        )}
      </div>
    </Card>
  );
};
