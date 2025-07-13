// youtubeSummarizer.js
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; // ✅ Secure
export async function summarizeYouTubeVideo(videoUrl, mode = 'summary') {
  // Extract video ID from YouTube URL
  const videoId = extractVideoId(videoUrl);
  
  if (!videoId) {
    return 'Please provide a valid YouTube URL.';
  }

  try {
    // First, get video metadata (title, description, etc.)
    const videoInfo = await getVideoInfo(videoId);
    
    if (!videoInfo) {
      return 'Could not fetch video information. Please check the URL and try again.';
    }

    // Create a comprehensive prompt for summarization
    let prompt;
    switch (mode) {
      case 'summary':
        prompt = `Please provide a comprehensive summary of this YouTube video:

Title: ${videoInfo.title}
Description: ${videoInfo.description}
Duration: ${videoInfo.duration}
Author: ${videoInfo.author}

Please create a structured summary with:
1. Main topics covered
2. Key points and concepts
3. Important takeaways
4. Difficulty level assessment
5. Prerequisites (if any)

Make it easy to understand and well-organized.`;
        break;
      
      case 'notes':
        prompt = `Create detailed study notes from this YouTube video:

Title: ${videoInfo.title}
Description: ${videoInfo.description}
Duration: ${videoInfo.duration}
Author: ${videoInfo.author}

Please organize the notes with:
- Main headings and subheadings
- Key definitions and concepts
- Important formulas or examples
- Practice questions or exercises
- Related topics for further study

Format it like a proper study guide.`;
        break;
      
      case 'quiz':
        prompt = `Generate a quiz based on this YouTube video:

Title: ${videoInfo.title}
Description: ${videoInfo.description}
Duration: ${videoInfo.duration}
Author: ${videoInfo.author}

Create 5-7 multiple choice questions that test understanding of the main concepts. Include:
- Question with 4 options (A, B, C, D)
- Correct answer
- Brief explanation of why it's correct
- Difficulty level for each question

Format it clearly for easy reading.`;
        break;
      
      default:
        prompt = `Summarize this YouTube video in a clear, educational format:

Title: ${videoInfo.title}
Description: ${videoInfo.description}
Duration: ${videoInfo.duration}
Author: ${videoInfo.author}`;
    }

    // Call Groq API for summarization
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
            content: 'You are an expert educational content analyzer and summarizer. You create clear, structured, and educational summaries of video content.',
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
    console.error('YouTube Summarizer Error:', error.message);
    return 'Sorry, something went wrong while summarizing the video. Please check the URL and try again.';
  }
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*&v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

async function getVideoInfo(videoId) {
  try {
    // For now, we'll use a simple approach with video metadata
    // In a real implementation, you might want to use YouTube Data API
    // or a service like RapidAPI for more detailed information
    
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    
    if (!response.ok) {
      console.warn('Could not fetch video info from YouTube oEmbed API');
      return {
        title: 'Video Analysis',
        description: 'Analyzing video content...',
        duration: 'Unknown',
        thumbnail: null,
        author: 'Unknown'
      };
    }
    
    const data = await response.json();
    
    return {
      title: data.title || 'Unknown Title',
      description: data.description || 'No description available',
      duration: 'Duration not available', // YouTube oEmbed doesn't provide duration
      thumbnail: data.thumbnail_url,
      author: data.author_name || 'Unknown Author'
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return {
      title: 'Video Analysis',
      description: 'Analyzing video content...',
      duration: 'Unknown',
      thumbnail: null,
      author: 'Unknown'
    };
  }
} 