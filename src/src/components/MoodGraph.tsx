
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface MoodGraphProps {
  data: Array<{ time: string; emotion: string; value: number }>;
}

export const MoodGraph = ({ data }: MoodGraphProps) => {
  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Mood Trends</h3>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${props.payload.emotion} (${Math.round(value * 100)}% positive)`,
                  'Mood'
                ]}
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
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>😫 Low</span>
          <span>😐 Neutral</span>
          <span>😊 High</span>
        </div>
      </div>
    </Card>
  );
};
