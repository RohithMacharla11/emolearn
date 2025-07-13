
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Brain, Heart, Clock, Star } from 'lucide-react';

export const ProgressBadges = () => {
  const badges = [
    {
      icon: Trophy,
      title: 'Focus Champ',
      description: '1 hour without distractions',
      earned: true,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Heart,
      title: 'Calm Master',
      description: 'Recovered from frustration',
      earned: true,
      color: 'from-pink-400 to-red-500'
    },
    {
      icon: Brain,
      title: 'Curious Learner',
      description: 'Asked 10+ questions',
      earned: false,
      color: 'from-blue-400 to-purple-500'
    },
    {
      icon: Target,
      title: 'Goal Achiever',
      description: 'Completed daily target',
      earned: false,
      color: 'from-green-400 to-teal-500'
    },
    {
      icon: Clock,
      title: 'Time Master',
      description: '5 focused sessions',
      earned: true,
      color: 'from-indigo-400 to-blue-500'
    },
    {
      icon: Star,
      title: 'Quiz Master',
      description: '90% quiz accuracy',
      earned: false,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const stats = [
    { label: 'Study Streak', value: '7 days', color: 'text-green-600' },
    { label: 'Focus Score', value: '85%', color: 'text-blue-600' },
    { label: 'Questions Asked', value: '23', color: 'text-purple-600' },
    { label: 'Concepts Mastered', value: '12', color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Stats</h3>
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievement Badges */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
        <div className="space-y-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                badge.earned
                  ? `bg-gradient-to-r ${badge.color} text-white shadow-lg`
                  : 'bg-gray-100/50 text-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  badge.earned ? 'bg-white/20' : 'bg-gray-300'
                }`}>
                  <badge.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{badge.title}</h4>
                  <p className={`text-xs ${badge.earned ? 'text-white/80' : 'text-gray-500'}`}>
                    {badge.description}
                  </p>
                </div>
                {badge.earned && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    Earned
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Goal */}
      <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Weekly Goal</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Study Hours</span>
            <span className="font-semibold">12 / 20 hrs</span>
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 w-3/5"></div>
          </div>
          <p className="text-xs text-blue-100">8 hours to go this week!</p>
        </div>
      </Card>
    </div>
  );
};
