
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, CameraOff, Mic, MicOff, Coffee, MessageCircle, BookOpen, Timer } from 'lucide-react';

interface ControlPanelProps {
  isCameraOn: boolean;
  setIsCameraOn: (value: boolean) => void;
  isMicOn: boolean;
  setIsMicOn: (value: boolean) => void;
  onBreathingExercise: () => void;
  onAssistantToggle: () => void;
}

export const ControlPanel = ({
  isCameraOn,
  setIsCameraOn,
  isMicOn,
  setIsMicOn,
  onBreathingExercise,
  onAssistantToggle
}: ControlPanelProps) => {
  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Learning Controls</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Camera Toggle */}
          <Button
            variant={isCameraOn ? "default" : "outline"}
            className={`flex flex-col items-center space-y-2 h-20 ${
              isCameraOn 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                : 'border-2 border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setIsCameraOn(!isCameraOn)}
          >
            {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            <span className="text-xs">Camera</span>
          </Button>

          {/* Mic Toggle */}
          <Button
            variant={isMicOn ? "default" : "outline"}
            className={`flex flex-col items-center space-y-2 h-20 ${
              isMicOn 
                ? 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700' 
                : 'border-2 border-gray-200 hover:border-green-300'
            }`}
            onClick={() => setIsMicOn(!isMicOn)}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            <span className="text-xs">Microphone</span>
          </Button>

          {/* Break Timer */}
          <Button
            variant="outline"
            className="flex flex-col items-center space-y-2 h-20 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
            onClick={onBreathingExercise}
          >
            <Coffee className="w-5 h-5 text-orange-500" />
            <span className="text-xs">Take Break</span>
          </Button>

          {/* AI Assistant */}
          <Button
            variant="outline"
            className="flex flex-col items-center space-y-2 h-20 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
            onClick={onAssistantToggle}
          >
            <MessageCircle className="w-5 h-5 text-purple-500" />
            <span className="text-xs">AI Help</span>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
            <BookOpen className="w-4 h-4 mr-2" />
            Quiz Me
          </Button>
          <Button size="sm" variant="outline" className="hover:bg-green-50 hover:border-green-300">
            <Timer className="w-4 h-4 mr-2" />
            Focus Mode
          </Button>
          <Button size="sm" variant="outline" className="hover:bg-red-50 hover:border-red-300">
            Don't Disturb
          </Button>
        </div>
      </div>
    </Card>
  );
};
