// groqGPT.js
require('dotenv').config();
const GROQ_API_KEY = process.env.GROQ_API_KEY; // ✅ Secure

export async function askGroq(topic, mode = 'simple') {
  let prompt;

  switch (mode) {
    case 'im5':
      prompt = `Explain the topic "${topic}" in very simple terms, like you're explaining it to a 5-year-old. Include practical real-world examples.`;
      break;
    case 'story':
      prompt = `Tell a short, engaging story that explains the topic "${topic}" in a relatable way. Make it fun and easy to understand.`;
      break;
    case 'quiz':
      prompt = `Generate a short quiz (3-5 questions) for the topic "${topic}". Include multiple choice options and the correct answers.`;
      break;
    case 'resources':
      prompt = `Provide curated study resources for "${topic}", such as PDF guides, roadmaps, YouTube video links, and helpful articles. Group them by Beginner, Intermediate, and Advanced.`;
      break;
    case 'youtube':
      // Check if the topic looks like a YouTube URL
      if (topic.includes('youtube.com') || topic.includes('youtu.be')) {
        // Import and use the YouTube summarizer
        const { summarizeYouTubeVideo } = await import('./youtubeSummarizer.js');
        return await summarizeYouTubeVideo(topic, 'summary');
      } else {
        prompt = `I notice you mentioned YouTube. Please provide a YouTube video URL that you'd like me to summarize. I can create summaries, study notes, or quizzes from educational videos.`;
      }
      break;
    default:
      prompt = `Explain the topic "${topic}" in under 140 words for a beginner. Use simple language and examples.`;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly and helpful AI tutor that adapts to different learning needs.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error from Groq API');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq Error:', error.message);
    return 'Sorry, something went wrong while generating the response.';
  }
}
