import Groq from "groq-sdk"
import { GROQ_CONFIG } from "../config/groq"
import type { Explanation } from "../types"

const groq = new Groq({
  apiKey: GROQ_CONFIG.apiKey,
})

export interface GroqResponse {
  explanation: Explanation
  success: boolean
  error?: string
}

export const generateAIExplanation = async (topic: string): Promise<GroqResponse> => {
  try {
    const prompt = `You are an expert AI tutor. Please provide a comprehensive explanation for the topic: "${topic}".

Please structure your response in the following JSON format:
{
  "title": "Topic Title",
  "overview": "A clear, engaging overview of the topic (2-3 sentences)",
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"],
  "examples": [
    {
      "title": "Example Title",
      "code": "Code example here"
    }
  ],
  "learningPath": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
}

Guidelines:
- Make the overview conversational and engaging for voice narration
- Include 5 key concepts that are most important for understanding the topic
- Provide 2 practical examples with code (if applicable)
- Create a 5-step learning path from beginner to advanced
- Keep responses educational, clear, and suitable for voice narration
- If it's a programming topic, include actual code examples
- If it's a non-programming topic, provide practical examples or case studies

Topic: ${topic}`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert AI tutor that provides structured, educational explanations. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: GROQ_CONFIG.model,
      temperature: GROQ_CONFIG.temperature,
      max_tokens: GROQ_CONFIG.maxTokens,
      top_p: GROQ_CONFIG.topP,
    })

    const responseText = completion.choices[0]?.message?.content || ""
    
    // Try to parse the JSON response
    try {
      const explanation: Explanation = JSON.parse(responseText)
      
      // Validate the response structure
      if (!explanation.title || !explanation.overview || !explanation.keyConcepts || !explanation.examples || !explanation.learningPath) {
        throw new Error("Invalid response structure")
      }

      return {
        explanation,
        success: true
      }
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      console.error("Failed to parse AI response:", parseError)
      return {
        explanation: createFallbackExplanation(topic, responseText),
        success: true
      }
    }

  } catch (error) {
    console.error("Groq API error:", error)
    return {
      explanation: createFallbackExplanation(topic),
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }
  }
}

const createFallbackExplanation = (topic: string, aiResponse?: string): Explanation => {
  return {
    title: `${topic} - Complete Guide`,
    overview: aiResponse || `${topic} is a fascinating subject that covers various aspects and applications. This comprehensive guide will help you understand the fundamentals and advanced concepts through practical examples and step-by-step learning.`,
    keyConcepts: [
      'Basic Principles',
      'Core Concepts', 
      'Advanced Topics',
      'Practical Applications',
      'Best Practices'
    ],
    examples: [
      {
        title: 'Basic Example',
        code: `// Example for ${topic}\nconsole.log("Hello ${topic}!");`
      },
      {
        title: 'Advanced Example',
        code: `// Advanced implementation\nfunction ${topic}Example() {\n  return "This is an example";\n}`
      }
    ],
    learningPath: [
      'Start with fundamentals',
      'Learn core concepts',
      'Practice with examples',
      'Build projects',
      'Master advanced topics'
    ]
  }
} 