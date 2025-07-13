import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, ArrowLeft, ExternalLink, Play, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { games, Game } from '@/config/games';
import { getGameUrl } from '@/config/gameServer';

interface GamesSectionProps {
  onClose: () => void;
}

export const GamesSection = ({ onClose }: GamesSectionProps) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emotions = [
    { id: 'all', name: 'All Games', icon: '🎮', color: 'from-gray-400 to-gray-600' },
    { id: 'Boredom', name: 'Boredom', icon: '😴', color: 'from-blue-400 to-blue-600' },
    { id: 'Confusion', name: 'Confusion', icon: '🤔', color: 'from-yellow-400 to-yellow-600' },
    { id: 'Fatigue', name: 'Fatigue', icon: '😴', color: 'from-green-400 to-green-600' },
    { id: 'Frustration', name: 'Frustration', icon: '😤', color: 'from-red-400 to-red-600' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Creative':
        return 'from-purple-400 to-purple-600';
      case 'Programming':
        return 'from-blue-400 to-blue-600';
      case 'Puzzle':
        return 'from-orange-400 to-orange-600';
      case 'Reflex':
        return 'from-green-400 to-green-600';
      case 'Energy':
        return 'from-pink-400 to-pink-600';
      case 'Trivia':
        return 'from-indigo-400 to-indigo-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'Boredom':
        return '😴';
      case 'Confusion':
        return '🤔';
      case 'Fatigue':
        return '😴';
      case 'Frustration':
        return '😤';
      default:
        return '🎮';
    }
  };

  const getGameIcon = (gameId: string) => {
    switch (gameId) {
      // Boredom Games
      case 'emoji-doodle':
        return '🎨';
      case 'story-spinner':
        return '📖';
      case 'puzzle-pop':
        return '🧩';
      
      // Confusion Games
      case 'line-shuffle':
        return '🔀';
      case 'concept-match':
        return '🔗';
      case 'time-to-solve':
        return '⏰';
      
      // Fatigue Games
      case 'quick-match':
        return '⚡';
      case 'reflex-dash':
        return '🏃';
      case 'juice-it-up':
        return '🥤';
      
      // Frustration Games
      case 'smash-the-bug':
        return '🐛';
      case 'laugh-trivia':
        return '😄';
      case 'arrange-the-code':
        return '📝';
      
      default:
        return '🎮';
    }
  };

  const handlePlayGame = async (game: Game) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the configured game server URL
      const fullUrl = getGameUrl(game.gameUrl);
      
      // Test if the game server is accessible
      const response = await fetch(fullUrl, { method: 'HEAD' });
      
      if (response.ok) {
        window.open(fullUrl, '_blank');
      } else {
        throw new Error('Game server not responding');
      }
    } catch (err) {
      setError(`Unable to load ${game.title}. Please make sure the game server is running on port 8000.`);
      console.error('Game loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGames = selectedEmotion === 'all' 
    ? games 
    : games.filter(game => game.emotion === selectedEmotion);

  if (selectedGame) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold">{selectedGame.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedGame(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Games
          </Button>
        </div>

        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-0">
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <span className="text-4xl">{getEmotionIcon(selectedGame.emotion)}</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">{selectedGame.title}</h4>
              <p className="text-gray-600 mb-4">{selectedGame.description}</p>
              
              <div className="flex justify-center space-x-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedGame.difficulty)}`}>
                  {selectedGame.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {selectedGame.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                  {selectedGame.emotion}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayGame(selectedGame)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => handlePlayGame(selectedGame)}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Loading...' : 'Play Game'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePlayGame(selectedGame)}
                disabled={isLoading}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                Make sure the backend server is running on port 8000
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-white/95 backdrop-blur-md py-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold">EmoLearn Games</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Assistant
        </Button>
      </div>

      {/* Emotion Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {emotions.map((emotion) => (
          <Button
            key={emotion.id}
            variant={selectedEmotion === emotion.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedEmotion(emotion.id)}
            className={`flex items-center space-x-2 ${
              selectedEmotion === emotion.id 
                ? `bg-gradient-to-r ${emotion.color} text-white border-0` 
                : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{emotion.icon}</span>
            <span>{emotion.name}</span>
          </Button>
        ))}
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="text-yellow-700 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {filteredGames.map((game) => (
          <Card
            key={game.id}
            onClick={() => setSelectedGame(game)}
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-0 transform hover:scale-[1.02]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(game.category)} rounded-full flex items-center justify-center`}>
                  <span className="text-lg">{getGameIcon(game.id)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                  {game.difficulty}
                </span>
              </div>
              
              <div className="text-left">
                <h4 className="font-medium text-sm text-gray-800 mb-1">{game.title}</h4>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{game.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {game.category}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                    {game.emotion}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-gray-500">
          Games designed for different emotional states to enhance learning experience
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Total: {filteredGames.length} games • Filtered by: {selectedEmotion === 'all' ? 'All Emotions' : selectedEmotion}
        </p>
        <p className="text-xs text-blue-500 mt-2">
          💡 Tip: Make sure the backend server is running on port 8000
        </p>
      </div>
    </div>
  );
}; 