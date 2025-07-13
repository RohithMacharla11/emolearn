import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, BookOpen, Lightbulb, Target, Users, Volume2, VolumeX, Pause } from 'lucide-react'
import TopicInput from './TopicInput'
import type { Explanation } from '../types'

const AITutor = () => {
  const [topic, setTopic] = useState('')
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentSection, setCurrentSection] = useState<string>('')
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechRef.current = new SpeechSynthesisUtterance()
      speechRef.current.rate = 0.8
      speechRef.current.pitch = 1
      speechRef.current.volume = 0.8

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()
        const englishVoice = voices.find(voice =>
          voice.lang.includes('en') && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang.includes('en'))

        if (englishVoice && speechRef.current) {
          speechRef.current.voice = englishVoice
        }
      }

      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const typeText = (text: string, onComplete?: () => void) => {
    setIsTyping(true)
    setTypingText('')
    let index = 0

    const typeChar = () => {
      if (index < text.length) {
        const char = text[index]
        setTypingText(prev => prev + char)
        index++
        const delay = char === '.' || char === ',' ? 120 : 30
        animationRef.current = requestAnimationFrame(() => {
          setTimeout(typeChar, delay)
        })
      } else {
        setIsTyping(false)
        if (onComplete) onComplete()
      }
    }

    typeChar()
  }

  const speakWithAnimation = (text: string, section: string) => {
    if (!speechRef.current || isMuted) return

    setCurrentSection(section)
    typeText(text, () => {
      if (!isMuted) {
        speechRef.current!.text = text
        speechRef.current!.onstart = () => setIsSpeaking(true)
        speechRef.current!.onend = () => setIsSpeaking(false)
        speechSynthesis.speak(speechRef.current!)
      }
    })
  }

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      setIsTyping(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (isSpeaking) stopSpeaking()
  }

  const generateExplanationFromAPI = async (topicName: string): Promise<Explanation> => {
    const response = await fetch('http://localhost:8000/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topicName })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      title: data.title || topicName,
      overview: data.overview || 'No overview available',
      keyConcepts: data.keyConcepts || [],
      examples: data.examples || [],
      learningPath: data.learningPath || []
    }
  }

  const handleTopicSubmit = async (topicName: string) => {
    if (!topicName.trim()) return
    setTopic(topicName)
    setIsLoading(true)
    setError('')
    setExplanation(null)
    stopSpeaking()

    try {
      const explanationFromAPI = await generateExplanationFromAPI(topicName)
      setExplanation(explanationFromAPI)
      setTimeout(() => {
        speakWithAnimation(explanationFromAPI.overview, 'overview')
      }, 500)
    } catch (err) {
      setError('❌ Failed to generate explanation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSectionClick = (section: string, text: string) => {
    stopSpeaking()
    speakWithAnimation(text, section)
  }

  return (
    <div className="ai-tutor">
      <div className="tutor-container">
        <div className="voice-controls">
          <button onClick={toggleMute} className={`voice-button ${isMuted ? 'muted' : ''}`} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX /> : <Volume2 />}
          </button>
          {isSpeaking && (
            <button onClick={stopSpeaking} className="voice-button stop" title="Stop Speaking">
              <Pause />
            </button>
          )}
          {isSpeaking && (
            <div className="speaking-indicator">
              <div className="speaking-dots"><span></span><span></span><span></span></div>
              Speaking...
            </div>
          )}
        </div>

        <TopicInput onSubmit={handleTopicSubmit} isLoading={isLoading} />

        {isLoading && (
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <p>🤖 AI is generating explanation for "{topic}"...</p>
            <p className="loading-subtitle">This may take a few seconds</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError('')} className="error-close">Try Again</button>
          </div>
        )}

        {explanation && !isLoading && (
          <div className="explanation-display">
            <h2>{explanation.title}</h2>
            <section onClick={() => handleSectionClick('overview', explanation.overview)}>
              <h3><BookOpen /> Overview</h3>
              <p>{typingText || explanation.overview}</p>
            </section>

            {explanation.keyConcepts.length > 0 && (
              <section onClick={() => handleSectionClick('keyConcepts', explanation.keyConcepts.join('. '))}>
                <h3><Users /> Key Concepts</h3>
                <ul>{explanation.keyConcepts.map((concept, idx) => <li key={idx}>{concept}</li>)}</ul>
              </section>
            )}

            {explanation.examples.length > 0 && (
              <section onClick={() => handleSectionClick('examples', explanation.examples.map(e => e.title + ' ' + e.code).join(' '))}>
                <h3><BookOpen /> Examples</h3>
                {explanation.examples.map((ex, idx) => (
                  <div key={idx}>
                    <strong>{ex.title}</strong>
                    <pre>{ex.code}</pre>
                  </div>
                ))}
              </section>
            )}

            {explanation.learningPath.length > 0 && (
              <section onClick={() => handleSectionClick('learningPath', explanation.learningPath.join('. '))}>
                <h3><Target /> Learning Path</h3>
                <ol>{explanation.learningPath.map((step, idx) => <li key={idx}>{step}</li>)}</ol>
              </section>
            )}
          </div>
        )}

        {!explanation && !isLoading && !error && (
          <div className="welcome-section">
            <div className="welcome-cards">
              <div className="welcome-card">
                <BookOpen className="card-icon" />
                <h3>Ask Any Topic</h3>
                <p>Try: JavaScript, React, Python, Machine Learning, History, Science</p>
              </div>
              <div className="welcome-card">
                <Lightbulb className="card-icon" />
                <h3>Voice Narration</h3>
                <p>Listen to explanations with AI voice</p>
              </div>
              <div className="welcome-card">
                <Target className="card-icon" />
                <h3>Interactive Learning</h3>
                <p>Click sections to hear specific explanations</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AITutor