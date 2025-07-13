import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';

interface EmotionData {
  time: string;
  facial_emotion: string;
  voice_emotion: string;
  interaction_emotion: string;
  final_emotion: string;
  value: number;
}

interface MoodGraphProps {
  data?: Array<{ time: string; emotion: string; value: number }>;
}

// Emotion to emoji mapping
const emotionToEmoji = (emotion: string): string => {
  switch (emotion) {
    case 'Confused': return '🤔';
    case 'Frustrated': return '😫';
    case 'Sleepy': return '💤';
    case 'Bored': return '😐';
    case 'Engaged': return '🎯';
    case 'Happy': return '😊';
    case 'Unknown': return '❓';
    case 'Face Not Detected': return '👤';
    default: return '❓';
  }
};

// Emotion to color mapping
const emotionToColor = (emotion: string): string => {
  switch (emotion) {
    case 'Confused': return '#f59e0b'; // Amber
    case 'Frustrated': return '#ef4444'; // Red
    case 'Sleepy': return '#8b5cf6'; // Purple
    case 'Bored': return '#6b7280'; // Gray
    case 'Engaged': return '#10b981'; // Green
    case 'Happy': return '#3b82f6'; // Blue
    case 'Unknown': return '#9ca3af'; // Light gray
    case 'Face Not Detected': return '#f97316'; // Orange
    default: return '#9ca3af';
  }
};

export const MoodGraph = ({ data }: MoodGraphProps) => {
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch emotion data from backend
  const fetchEmotionData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/emotion/latest');
      if (response.ok) {
        const latestData = await response.json();
        
        // Get all emotion data from the JSON file
        const allDataResponse = await fetch('http://localhost:8000/api/emotion/all');
        if (allDataResponse.ok) {
          const allData = await allDataResponse.json();
          // Get last 10 entries
          const last10Entries = allData.slice(-10);
          setEmotionData(last10Entries);
        } else {
          // Fallback: create sample data from latest entry
          if (latestData.time) {
            setEmotionData([latestData]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch emotion data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and every 10 seconds
  useEffect(() => {
    fetchEmotionData();
    const interval = setInterval(fetchEmotionData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Transform data for chart display
  const chartData = emotionData.map((entry, index) => ({
    time: new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: entry.value,
    emotion: entry.final_emotion,
    emoji: emotionToEmoji(entry.final_emotion),
    color: emotionToColor(entry.final_emotion),
    facial: entry.facial_emotion,
    voice: entry.voice_emotion,
    interaction: entry.interaction_emotion,
    index
  }));

  // Create emotion distribution data
  const emotionDistribution = emotionData.reduce((acc, entry) => {
    const emotion = entry.final_emotion;
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const distributionData = Object.entries(emotionDistribution).map(([emotion, count]) => ({
    emotion,
    count,
    emoji: emotionToEmoji(emotion),
    color: emotionToColor(emotion)
  }));

  if (loading) {
    return (
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Mood Trends</h3>
          <div className="h-48 flex items-center justify-center">
            <div className="text-gray-500">Loading emotion data...</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Mood Trends</h3>
        
        {/* Line Chart - Emotion Value Over Time */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Emotion Intensity Over Time</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  domain={[0, 1]}
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string, props: { payload: { emoji: string; emotion: string } }) => [
                    `${props.payload.emoji} ${props.payload.emotion} (${Math.round(value * 100)}%)`,
                    'Intensity'
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="url(#moodGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#8b5cf6' }}
                />
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Distribution Bar Chart */}
        {distributionData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Emotion Distribution</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <XAxis 
                    dataKey="emoji" 
                    axisLine={false}
                    tickLine={false}
                    className="text-sm"
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number, name: string, props: { payload: { emotion: string } }) => [
                      `${value} times`,
                      props.payload.emotion
                    ]}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Recent Emotions List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Recent Emotions</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {chartData.slice().reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{entry.emoji}</span>
                  <span className="text-sm font-medium">{entry.emotion}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {entry.time}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
          <span>😫 Low</span>
          <span>😐 Neutral</span>
          <span>😊 High</span>
        </div>
      </div>
    </Card>
  );
};
