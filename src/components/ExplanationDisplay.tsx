import { BookOpen, Code, Target, Lightbulb, Volume2 } from 'lucide-react'
import type { Explanation } from '../types'

interface ExplanationDisplayProps {
  explanation: Explanation
  onSectionClick?: (section: string, text: string) => void
  currentSection?: string
  typingText?: string
  isTyping?: boolean
}

const ExplanationDisplay = ({ 
  explanation, 
  onSectionClick, 
  currentSection, 
  typingText, 
  isTyping 
}: ExplanationDisplayProps) => {
  
  const handleSectionClick = (section: string, text: string) => {
    if (onSectionClick) {
      onSectionClick(section, text)
    }
  }

  const renderText = (text: string, section: string) => {
    if (currentSection === section && isTyping && typingText) {
      return (
        <span>
          {typingText}
          <span className="typing-cursor">|</span>
        </span>
      )
    }
    return text
  }

  return (
    <div className="explanation-display">
      <div className="explanation-header">
        <h2>{explanation.title}</h2>
      </div>

      <div className="explanation-content">
        {/* Overview Section */}
        <section 
          className={`explanation-section ${currentSection === 'overview' ? 'active' : ''}`}
          onClick={() => handleSectionClick('overview', explanation.overview)}
        >
          <div className="section-header">
            <BookOpen className="section-icon" />
            <h3>Overview</h3>
            <Volume2 className="voice-icon" />
          </div>
          <p className="overview-text">
            {renderText(explanation.overview, 'overview')}
          </p>
        </section>

        {/* Key Concepts Section */}
        <section className="explanation-section">
          <div className="section-header">
            <Lightbulb className="section-icon" />
            <h3>Key Concepts</h3>
          </div>
          <div className="concepts-grid">
            {explanation.keyConcepts.map((concept, index) => (
              <div 
                key={index} 
                className="concept-item"
                onClick={() => handleSectionClick(`concept-${index}`, `Key concept ${index + 1}: ${concept}`)}
              >
                <span className="concept-number">{index + 1}</span>
                <span className="concept-text">{concept}</span>
                <Volume2 className="concept-voice-icon" />
              </div>
            ))}
          </div>
        </section>

        {/* Examples Section */}
        <section className="explanation-section">
          <div className="section-header">
            <Code className="section-icon" />
            <h3>Examples</h3>
          </div>
          <div className="examples-container">
            {explanation.examples.map((example, index) => (
              <div key={index} className="example-card">
                <div className="example-header">
                  <h4>{example.title}</h4>
                  <Volume2 
                    className="example-voice-icon"
                    onClick={() => handleSectionClick(`example-${index}`, `Example ${index + 1}: ${example.title}. Here's the code: ${example.code}`)}
                  />
                </div>
                <pre className="code-block">
                  <code>{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Path Section */}
        <section className="explanation-section">
          <div className="section-header">
            <Target className="section-icon" />
            <h3>Learning Path</h3>
          </div>
          <div className="learning-path">
            {explanation.learningPath.map((step, index) => (
              <div 
                key={index} 
                className="learning-step"
                onClick={() => handleSectionClick(`step-${index}`, `Learning step ${index + 1}: ${step}`)}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <p>{step}</p>
                </div>
                <Volume2 className="step-voice-icon" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="explanation-footer">
        <p>💡 Click on any section to hear it narrated! Try the voice controls above.</p>
      </div>
    </div>
  )
}

export default ExplanationDisplay 