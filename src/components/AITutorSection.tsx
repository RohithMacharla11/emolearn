import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2, BookOpen, Lightbulb, Target, Users, Volume2, VolumeX, Pause } from 'lucide-react';

interface AITutorSectionProps {
  onClose: () => void;
}

interface Explanation {
  title: string;
  overview: string;
  keyConcepts: string[];
  examples: Array<{ title: string; code: string }>;
  learningPath: string[];
}

export const AITutorSection = ({ onClose }: AITutorSectionProps) => {
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechRef.current = new SpeechSynthesisUtterance();
      speechRef.current.rate = 0.8;
      speechRef.current.pitch = 1;
      speechRef.current.volume = 0.8;

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice =>
          voice.lang.includes('en') && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang.includes('en'));

        if (englishVoice && speechRef.current) {
          speechRef.current.voice = englishVoice;
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      setError('Speech synthesis is not supported in this browser.');
    }
  }, []);

  const typeText = (text: string, onComplete?: () => void) => {
    setIsTyping(true);
    setTypingText('');
    let index = 0;

    const typeChar = () => {
      if (index < text.length) {
        const char = text[index];
        setTypingText(prev => prev + char);
        index++;
        const delay = char === '.' || char === ',' ? 120 : 30;
        animationRef.current = requestAnimationFrame(() => {
          setTimeout(typeChar, delay);
        });
      } else {
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    };

    typeChar();
  };

  const speakWithAnimation = (text: string, section: string) => {
    if (!speechRef.current || isMuted) return;

    setCurrentSection(section);
    typeText(text, () => {
      if (!isMuted) {
        speechRef.current!.text = text;
        speechRef.current!.onstart = () => setIsSpeaking(true);
        speechRef.current!.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(speechRef.current!);
      }
    });
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setIsTyping(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isSpeaking) stopSpeaking();
  };

  const generateExplanationFromAPI = async (topicName: string): Promise<Explanation> => {
    try {
      const response = await fetch('http://localhost:8000/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicName })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        title: data.title || topicName,
        overview: data.overview || 'No overview available',
        keyConcepts: data.keyConcepts || [],
        examples: data.examples || [],
        learningPath: data.learningPath || []
      };
    } catch (err) {
      // If API fails, provide a fallback explanation
      console.warn('API call failed, using fallback explanation:', err);
      return generateFallbackExplanation(topicName);
    }
  };

  const generateFallbackExplanation = (topicName: string): Explanation => {
    // Fallback explanations for common topics
    const fallbackExplanations: Record<string, Explanation> = {
      "javascript": {
        title: "JavaScript Fundamentals",
        overview: "JavaScript is a versatile programming language that powers the modern web. It's used for creating interactive websites and web applications.",
        keyConcepts: [
          "Variables and Data Types",
          "Functions and Scope",
          "Objects and Arrays",
          "DOM Manipulation",
          "Asynchronous Programming"
        ],
        examples: [
          {
            title: "Basic Function",
            code: "function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World'));"
          }
        ],
        learningPath: [
          "Learn basic syntax",
          "Understand functions",
          "Master DOM manipulation",
          "Study async programming",
          "Practice with projects"
        ]
      },
      "react": {
        title: "React Framework",
        overview: "React is a popular JavaScript library for building user interfaces using a component-based architecture.",
        keyConcepts: [
          "Components and Props",
          "State and Lifecycle",
          "Hooks",
          "Virtual DOM",
          "JSX Syntax"
        ],
        examples: [
          {
            title: "Functional Component",
            code: "function Welcome(props) {\n  return <h1>Hello, {props.name}</h1>;\n}"
          }
        ],
        learningPath: [
          "Learn JSX syntax",
          "Understand components",
          "Master state management",
          "Learn React hooks",
          "Build applications"
        ]
      },
      "python": {
        title: "Python Programming",
        overview: "Python is a high-level programming language known for its simplicity and readability.",
        keyConcepts: [
          "Variables and Data Types",
          "Control Structures",
          "Functions and Modules",
          "Object-Oriented Programming",
          "File Handling"
        ],
        examples: [
          {
            title: "Basic Function",
            code: "def greet(name):\n    return f\"Hello, {name}!\"\n\nprint(greet(\"World\"))"
          }
        ],
        learningPath: [
          "Learn basic syntax",
          "Understand control structures",
          "Master functions",
          "Learn OOP",
          "Practice with projects"
        ]
      }
    };

    const topic = topicName.toLowerCase();
    if (fallbackExplanations[topic]) {
      return fallbackExplanations[topic];
    }

    // Generic fallback for unknown topics
    return {
      title: `${topicName} - Learning Guide`,
      overview: `${topicName} is an interesting topic to learn about. This guide will help you understand the fundamentals and core concepts.`,
      keyConcepts: [
        "Basic principles and fundamentals",
        "Core concepts and terminology",
        "Practical applications",
        "Best practices",
        "Common challenges and solutions"
      ],
      examples: [
        {
          title: "Basic Example",
          code: `// Basic ${topicName} example\n// Add your code here\nconsole.log('Hello, ${topicName}!');`
        }
      ],
      learningPath: [
        "Start with fundamentals",
        "Learn core concepts",
        "Practice with examples",
        "Build small projects",
        "Explore advanced topics"
      ]
    };
  };

  const handleTopicSubmit = async (topicName: string) => {
    if (!topicName.trim()) return;
    
    setTopic(topicName);
    setIsLoading(true);
    setError('');
    setExplanation(null);
    stopSpeaking();

    try {
      const explanationFromAPI = await generateExplanationFromAPI(topicName);
      setExplanation(explanationFromAPI);
      setRetryCount(0);
      setTimeout(() => {
        speakWithAnimation(explanationFromAPI.overview, 'overview');
      }, 500);
    } catch (err) {
      // This should rarely happen now since we have fallback explanations
      console.error('Unexpected error:', err);
      setError(`❌ Unexpected error occurred. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionClick = (section: string, text: string) => {
    stopSpeaking();
    speakWithAnimation(text, section);
  };

  const quickTopics = [
    { name: 'JavaScript', icon: '⚡' },
    { name: 'React', icon: '⚛️' },
    { name: 'Python', icon: '🐍' },
    { name: 'Machine Learning', icon: '🤖' }
  ];

  return (
    <div className="space-y-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-white/95 backdrop-blur-md py-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold">AI Tutor</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="ai-tutor">
        <div className="tutor-container">
          <div className="voice-controls mb-4">
            <button onClick={toggleMute} className={`voice-button ${isMuted ? 'muted' : ''}`} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {isSpeaking && (
              <button onClick={stopSpeaking} className="voice-button stop" title="Stop Speaking">
                <Pause className="w-4 h-4" />
              </button>
            )}
            {isSpeaking && (
              <div className="speaking-indicator">
                <div className="speaking-dots"><span></span><span></span><span></span></div>
                Speaking...
              </div>
            )}
          </div>

          <Card className="p-4 mb-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter any topic to learn about..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleTopicSubmit(topic);
                    }
                  }}
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleTopicSubmit(topic)}
                  disabled={isLoading || !topic.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickTopics.map((qt) => (
                  <Button
                    key={qt.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTopicSubmit(qt.name)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    <span className="mr-1">{qt.icon}</span>
                    {qt.name}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {isLoading && (
            <Card className="p-6 text-center bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
              <p className="text-lg font-medium">🤖 AI is generating explanation for "{topic}"...</p>
              <p className="text-sm text-gray-600 mt-1">This may take a few seconds</p>
            </Card>
          )}

          {error && (
            <Card className="p-4 bg-red-50 border-red-200 border-0 shadow-lg">
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={() => {
                  setError('');
                  handleTopicSubmit(topic);
                }} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Try Again
              </Button>
            </Card>
          )}

          {explanation && !isLoading && (
            <div className="space-y-4">
              <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{explanation.title}</h2>
                
                <div className="space-y-4">
                  <section 
                    onClick={() => handleSectionClick('overview', explanation.overview)}
                    className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <h3 className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                      <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                      Overview
                    </h3>
                    <p className="text-gray-600">{currentSection === 'overview' && isTyping ? typingText : explanation.overview}</p>
                  </section>

                  {explanation.keyConcepts.length > 0 && (
                    <section 
                      onClick={() => handleSectionClick('keyConcepts', explanation.keyConcepts.join('. '))}
                      className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <h3 className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                        <Users className="w-5 h-5 mr-2 text-indigo-500" />
                        Key Concepts
                      </h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {explanation.keyConcepts.map((concept, idx) => (
                          <li key={idx}>{concept}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {explanation.examples.length > 0 && (
                    <section 
                      onClick={() => handleSectionClick('examples', explanation.examples.map(e => e.title + ' ' + e.code).join(' '))}
                      className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <h3 className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                        <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                        Examples
                      </h3>
                      <div className="space-y-3">
                        {explanation.examples.map((ex, idx) => (
                          <div key={idx} className="bg-gray-100 p-3 rounded-lg">
                            <strong className="text-gray-800">{ex.title}</strong>
                            <pre className="mt-2 text-sm bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
                              {ex.code}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {explanation.learningPath.length > 0 && (
                    <section 
                      onClick={() => handleSectionClick('learningPath', explanation.learningPath.join('. '))}
                      className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <h3 className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                        <Target className="w-5 h-5 mr-2 text-indigo-500" />
                        Learning Path
                      </h3>
                      <ol className="list-decimal list-inside text-gray-600 space-y-1">
                        {explanation.learningPath.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </section>
                  )}
                </div>
              </Card>
            </div>
          )}

          {!explanation && !isLoading && !error && (
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Welcome to AI Tutor</h3>
                <p className="text-gray-600">Enter any topic and get comprehensive explanations with voice narration</p>
                
                <div className="grid grid-cols-1 gap-3 mt-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-indigo-500" />
                    <div className="text-left">
                      <h4 className="font-medium text-sm">Smart Explanations</h4>
                      <p className="text-xs text-gray-600">Structured learning with overview, concepts, and examples</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Volume2 className="w-5 h-5 text-indigo-500" />
                    <div className="text-left">
                      <h4 className="font-medium text-sm">Voice Narration</h4>
                      <p className="text-xs text-gray-600">Listen to explanations with AI voice</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Target className="w-5 h-5 text-indigo-500" />
                    <div className="text-left">
                      <h4 className="font-medium text-sm">Interactive Learning</h4>
                      <p className="text-xs text-gray-600">Click sections to hear specific explanations</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};