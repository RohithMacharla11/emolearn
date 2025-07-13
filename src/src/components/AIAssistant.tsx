
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Brain, Heart, HelpCircle, BookOpen, Send, X } from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmotion: string;
}

export const AIAssistant = ({ isOpen, onClose, currentEmotion }: AIAssistantProps) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    {
      type: 'ai',
      text: getEmotionResponse(currentEmotion),
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  function getEmotionResponse(emotion: string) {
    switch (emotion) {
      case '🤔':
        return "I noticed you seem confused. Would you like me to explain this concept differently or provide additional examples?";
      case '😫':
        return "You seem frustrated. Let's take a step back. Would you like a quick breathing exercise or shall I break this down into smaller parts?";
      case '💤':
        return "Feeling a bit drowsy? Let's energize your learning! How about a quick interactive quiz or a short break?";
      case '😐':
        return "I can see you might be losing interest. Let's make this more engaging! Want to try a hands-on simulation?";
      default:
        return "Hi! I'm here to help optimize your learning experience. How can I assist you today?";
    }
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      setConversation(prev => [...prev, {
        type: 'user',
        text: message,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Simulate AI response
      setTimeout(() => {
        setConversation(prev => [...prev, {
          type: 'ai',
          text: "I understand your question. Let me provide a detailed explanation with visual examples...",
          timestamp: new Date().toLocaleTimeString()
        }]);
      }, 1000);
      
      setMessage('');
    }
  };

  const interventionOptions = [
    {
      icon: Brain,
      title: 'Explain Differently',
      description: 'Break down complex concepts',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: Heart,
      title: 'Breathing Exercise',
      description: 'Quick stress relief',
      color: 'from-pink-400 to-pink-600'
    },
    {
      icon: HelpCircle,
      title: 'Quick Quiz',
      description: 'Test your understanding',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: BookOpen,
      title: 'Study Resources',
      description: 'Additional materials',
      color: 'from-purple-400 to-purple-600'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white/95 backdrop-blur-md border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span>AI Learning Assistant</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Interventions */}
          <div className="grid grid-cols-2 gap-3">
            {interventionOptions.map((option) => (
              <Card 
                key={option.title}
                className="p-3 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50 border-0"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`w-10 h-10 bg-gradient-to-r ${option.color} rounded-full flex items-center justify-center`}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{option.title}</h4>
                    <p className="text-xs text-gray-600">{option.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Chat Interface */}
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 h-48 overflow-y-auto space-y-3">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything about the lesson..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="border-gray-200 focus:border-blue-400"
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
