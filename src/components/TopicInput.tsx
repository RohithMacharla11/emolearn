import { useState } from 'react'
import { Send, Search } from 'lucide-react'

interface TopicInputProps {
  onSubmit: (topic: string) => void
  isLoading: boolean
}

const TopicInput = ({ onSubmit, isLoading }: TopicInputProps) => {
  const [topic, setTopic] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="topic-input-container">
      <form onSubmit={handleSubmit} className="topic-input-form">
        <div className="input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a topic (e.g., JavaScript, React, Python, Machine Learning...)"
            className="topic-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <div className="button-loader" />
            ) : (
              <Send className="send-icon" />
            )}
          </button>
        </div>
      </form>
      
      <div className="quick-topics">
        <span>Quick topics:</span>
        {['JavaScript', 'React', 'Python', 'Machine Learning'].map((quickTopic) => (
          <button
            key={quickTopic}
            onClick={() => onSubmit(quickTopic)}
            disabled={isLoading}
            className="quick-topic-button"
          >
            {quickTopic}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TopicInput 