
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreathingExercise = ({ isOpen, onClose }: BreathingExerciseProps) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && isOpen) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            // Move to next phase
            setPhase((currentPhase) => {
              if (currentPhase === 'inhale') return 'hold';
              if (currentPhase === 'hold') return 'exhale';
              setCycleCount((count) => count + 1);
              return 'inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isOpen]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(4);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(4);
    setCycleCount(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 'scale-125';
      case 'hold': return 'scale-125';
      case 'exhale': return 'scale-75';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Breathing Exercise
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-8 py-8">
          {/* Breathing Circle */}
          <div className="relative">
            <div 
              className={`w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 transition-transform duration-[4000ms] ease-in-out ${
                isActive ? getCircleScale() : 'scale-100'
              } flex items-center justify-center shadow-2xl`}
            >
              <div className="text-white text-center">
                <div className="text-6xl font-bold mb-2">{countdown}</div>
                <div className="text-lg font-medium">{getPhaseText()}</div>
              </div>
            </div>
            
            {/* Pulsing Ring */}
            {isActive && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-30"></div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-gray-600">4-4-4 Breathing Pattern</p>
            <p className="text-sm text-gray-500">Inhale for 4, hold for 4, exhale for 4</p>
            <p className="text-sm font-medium text-blue-600">Cycles completed: {cycleCount}</p>
          </div>

          {/* Controls */}
          <div className="flex space-x-4">
            {!isActive ? (
              <Button
                onClick={handleStart}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-2 border-gray-300 hover:border-gray-400"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Benefits */}
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <p className="text-sm text-gray-600">
              This exercise helps reduce stress, improve focus, and enhance emotional regulation.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
