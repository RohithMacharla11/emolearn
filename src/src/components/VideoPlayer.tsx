
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';

export const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative group">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Video Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center relative">
          <div className="text-center text-white space-y-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </div>
            <h3 className="text-xl font-semibold">Neural Networks Fundamentals</h3>
            <p className="text-blue-200">Chapter 3: Deep Learning Architectures</p>
          </div>
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm">12:34 / 45:67</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-2 bg-white/30 rounded-full h-1">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full h-1 w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Live Status */}
      <div className="absolute top-4 right-4">
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>LIVE</span>
        </div>
      </div>
    </div>
  );
};
