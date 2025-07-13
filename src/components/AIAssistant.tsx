import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Brain, Heart, HelpCircle, BookOpen, Send, XCircle, Youtube, Gamepad2, Loader2 } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { askGroq } from '@/api/groqGPT';
import { YouTubeSummarizer } from './YouTubeSummarizer';
import { GamesSection } from './GamesSection';
import { AITutorSection } from './AITutorSection';
import './voice.css';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmotion: string;
  isEmotionTriggered?: boolean;
}
type ChatMessage = {
  type: 'user' | 'ai';
  text: string;
  timestamp: string;
};
export const AIAssistant = ({ isOpen, onClose, currentEmotion, isEmotionTriggered }: AIAssistantProps) => {
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showYouTubeSummarizer, setShowYouTubeSummarizer] = useState(false);
  const [showGamesSection, setShowGamesSection] = useState(false);
  const [showAITutorSection, setShowAITutorSection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Reset internal state when assistant is closed or emotion trigger changes
  useEffect(() => {
    if (!isOpen) {
      setShowConfirm(false);
      setShowChat(false);
      console.log("AI Assistant closed - resetting internal state");
    }
  }, [isOpen]);

  useEffect(() => {
    console.log(`AI Assistant state: isOpen=${isOpen}, isEmotionTriggered=${isEmotionTriggered}, showChat=${showChat}, showConfirm=${showConfirm}`);
    
    if (currentEmotion && isOpen && !showChat && !showConfirm) {
      if (isEmotionTriggered) {
        // Emotion-triggered: show popup first
        console.log("Showing emotion-triggered popup");
        setShowConfirm(true);
      } else {
        // Manual-triggered: open chat directly
        console.log("Opening manual-triggered chat");
        setShowChat(true);
      }
      
      // Setup initial AI message for when chat is opened
      setConversation([
        {
          type: 'ai',
          text: getEmotionResponse(currentEmotion),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [currentEmotion, isOpen, showChat, showConfirm, isEmotionTriggered]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Auto-close popup after 10 seconds
  useEffect(() => {
    if (showConfirm) {
      const timer = setTimeout(() => setShowConfirm(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showConfirm]);

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
      case '❓':
        return "I'm here to help optimize your learning experience. How can I assist you today?";
      default:
        return "Hi! I'm here to help optimize your learning experience. How can I assist you today?";
    }
  }

  const getConfirmMessage = (emotion: string) => {
    switch (emotion) {
      case '🤔':
        return 'You seem confused. Want to open AI Assistant?';
      case '😫':
        return 'You seem frustrated. Want to open AI Assistant?';
      case '💤':
        return 'Feeling sleepy? Need a quick quiz or break?';
      case '😐':
        return 'Losing interest? Want something more engaging?';
      case '❓':
        return 'Need help? Want to chat with AI Assistant?';
      default:
        return 'Want to chat with the AI Assistant?';
    }
  };

  const formatMessageText = (text: string) => {
    let html = text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*(?!\*)([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
    html = html.replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

    html = html.replace(/\n{2,}/g, '</p><p>');
    html = html.replace(/\n/g, '<br/>');
    return `<p>${html}</p>`;
  };

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversation(prev => [
      ...prev,
      { type: 'user', text: trimmed, timestamp }
    ]);
    setMessage('');

    // Auto-detect YouTube URLs and use appropriate mode
    let mode = 'simple';
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      mode = 'youtube';
    }

    const aiText = await askGroq(trimmed, mode);
    setConversation(prev => [
      ...prev,
      { type: 'ai', text: aiText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  const interventionOptions = [
    { icon: Brain, title: 'Explain Differently', description: 'Im 5 mode', color: 'from-blue-400 to-blue-600', mode: 'im5' },
    { icon: Heart, title: 'Story Mode', description: 'Concepts as stories', color: 'from-pink-400 to-pink-600', mode: 'story' },
    { icon: HelpCircle, title: 'Quick Quiz', description: 'Test your understanding', color: 'from-green-400 to-green-600', mode: 'quiz' },
    { icon: BookOpen, title: 'Study Resources', description: 'Additional materials', color: 'from-purple-400 to-purple-600', mode: 'resources' },
    { icon: Youtube, title: 'Summarize the Class', description: 'Summarize YouTube videos', color: 'from-red-400 to-red-600', mode: 'youtube' },
    { icon: Gamepad2, title: 'Games', description: 'Play interactive games', color: 'from-orange-400 to-orange-600', mode: 'games' },
    { icon: BookOpen, title: 'AI Tutor', description: 'Learn any topic with AI', color: 'from-indigo-500 to-purple-600', mode: 'aitutor' }
  ];

  const handleIntervention = async (mode: string) => {
    setIsLoading(true);
    
    if (mode === 'youtube') {
      setShowYouTubeSummarizer(true);
      setIsLoading(false);
      return;
    }
    
    if (mode === 'games') {
      setShowGamesSection(true);
      setIsLoading(false);
      return;
    }
    
    if (mode === 'aitutor') {
      setShowAITutorSection(true);
      setIsLoading(false);
      return;
    }
    
    let prompt = message.trim();
    
    if (!prompt) {
      prompt = 'Explain this concept in a different way.';
    }
    
    const aiText = await askGroq(prompt, mode);
    setConversation(prev => [
      ...prev,
      {
        type: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    
    setIsLoading(false);
  };

  const handleYouTubeSummaryComplete = (summary: string) => {
    setShowYouTubeSummarizer(false);
    setConversation(prev => [
      ...prev,
      {
        type: 'ai',
        text: summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleGamesSectionClose = () => {
    setShowGamesSection(false);
  };

  const handleAITutorSectionClose = () => {
    setShowAITutorSection(false);
  };

  return (
    <>
      {showConfirm && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <div className="bg-white max-w-sm w-full rounded-xl shadow-lg border px-5 py-4 flex flex-col space-y-3 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => { setShowConfirm(false); onClose(); }}
              aria-label="Close popup"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-800">{getConfirmMessage(currentEmotion)}</span>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" size="sm" onClick={() => { setShowConfirm(false); onClose(); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => { setShowConfirm(false); setShowChat(true); }}>
                Yes, Open
              </Button>
            </div>
          </div>
        </div>
      )}

      {showChat && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent 
            className={`${showYouTubeSummarizer || showGamesSection || showAITutorSection ? 'max-w-2xl' : 'max-w-lg'} bg-white/95 backdrop-blur-md border-0 shadow-2xl`}
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-2">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span>AI Learning Assistant</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="space-y-4">
              {showYouTubeSummarizer ? (
                <div className="animate-in fade-in duration-300">
                  <YouTubeSummarizer
                    onSummaryComplete={handleYouTubeSummaryComplete}
                    onClose={() => setShowYouTubeSummarizer(false)}
                  />
                </div>
              ) : showGamesSection ? (
                <div className="animate-in fade-in duration-300">
                  <GamesSection
                    onClose={handleGamesSectionClose}
                  />
                </div>
              ) : showAITutorSection ? (
                <div className="animate-in fade-in duration-300">
                  <AITutorSection onClose={handleAITutorSectionClose} />
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {interventionOptions.map((option) => (
                        <Card
                          key={option.title}
                          onClick={() => !isLoading && handleIntervention(option.mode)}
                          className={`p-3 cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-0 transform hover:scale-[1.02] ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className={`w-10 h-10 bg-gradient-to-r ${option.color} rounded-full flex items-center justify-center shadow-md`}>
                              {isLoading ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                              ) : (
                                <option.icon className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{option.title}</h4>
                              <p className="text-xs text-gray-600">{option.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 h-48 overflow-y-auto space-y-3">
                        {conversation.map((msg, index) => (
                          <div
                            key={`${msg.type}-${msg.timestamp}-${index}`}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] p-3 rounded-2xl break-words whitespace-pre-wrap ${
                                msg.type === 'user'
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                                  : 'bg-gray-100 text-black rounded-bl-none'
                              }`}
                            >
                              <div
                                className="text-sm"
                                dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                              />
                              <p className="text-xs mt-1 text-right opacity-70">
                                {msg.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="flex space-x-2 items-center">
                        <Input
                          placeholder="Ask me anything or paste a YouTube URL..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="border-gray-200 focus:border-blue-400"
                        />
                        <VoiceInput
                          onResult={(text: string) => {
                            setMessage(text);
                            handleSendMessage();
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          aria-label="Send"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};