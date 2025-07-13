from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
from modules.emotion_combiner import get_combined_emotion, toggle_camera, toggle_mic

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI()

# Allow frontend on localhost:5173 to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
try:
    client = Groq(api_key=GROQ_API_KEY)
except Exception as e:
    print(f"Failed to initialize Groq client: {e}")
    client = None

class TopicRequest(BaseModel):
    topic: str

@app.get("/")
async def root():
    return {"message": "🧠 EmoLearn Nexus Backend is Running!"}

@app.get("/api/emotion")
def get_emotion():
    emotion = get_combined_emotion()
    return {"emotion": emotion}

@app.post("/api/toggle_camera")
def toggle_camera_endpoint(state: bool):
    toggle_camera(state)
    return {"status": "success", "camera_enabled": state}

@app.post("/api/toggle_mic")
def toggle_mic_endpoint(state: bool):
    toggle_mic(state)
    return {"status": "success", "mic_enabled": state}

@app.post("/explain")
async def explain_topic(request: TopicRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured or Groq client failed to initialize")

    topic = request.topic.strip()

    prompt = f"""
You are an AI Tutor that provides clear, beginner-friendly, and structured explanations.

Please explain the topic: "{topic}"

Use the following format in your response:

AI TUTOR EXPLANATION FOR: {topic}

OVERVIEW:
[Brief explanation of what {topic} is and why it's important]

KEY CONCEPTS:
1. [Concept 1]
2. [Concept 2]
3. [Concept 3]

BASIC EXAMPLES:
Example 1:
[Simple code or real-world analogy]
Example 2:
[Another basic example]

TIPS:
- [Helpful Tip 1]
- [Helpful Tip 2]
- [Helpful Tip 3]

LEARNING PATH:
1. [Step 1 to learn {topic}]
2. [Step 2]
3. [Step 3]

Only provide explanations relevant to the topic. Use simple language where possible. Be encouraging and clear like a real tutor.
"""

    try:
        chat_completion = client.chat.completions.create(
            model="llama3-8b-8192",  # Use the correct Groq model name
            messages=[
                {"role": "system", "content": "You are a friendly and helpful AI Tutor. You teach technical topics in clear, structured, and easy-to-follow ways."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2048
        )

        response_text = chat_completion.choices[0].message.content.strip()

        # Initialize result
        result = {
            "title": topic,
            "overview": "",
            "keyConcepts": [],
            "examples": [],
            "learningPath": []
        }

        current_section = None
        example_title = None
        example_code = []
        for line in response_text.splitlines():
            line = line.strip()
            if not line:
                continue

            # Section headers
            if line.upper().startswith("OVERVIEW:"):
                current_section = "overview"
                result["overview"] = line[len("OVERVIEW:"):].strip()
            elif line.upper().startswith("KEY CONCEPTS:"):
                current_section = "keyConcepts"
            elif line.upper().startswith("BASIC EXAMPLES:"):
                current_section = "examples"
                example_title = None
                example_code = []
            elif line.upper().startswith("TIPS:"):
                current_section = None  # Skip tips
            elif line.upper().startswith("LEARNING PATH:"):
                current_section = "learningPath"
            # Section content
            elif current_section == "overview":
                result["overview"] += " " + line
            elif current_section == "keyConcepts" and line[:2].isdigit():
                concept = line.split('.', 1)[1].strip()
                if concept:
                    result["keyConcepts"].append(concept)
            elif current_section == "examples":
                if line.lower().startswith("example") and ":" in line:
                    if example_title and example_code:
                        result["examples"].append({
                            "title": example_title,
                            "code": "\n".join(example_code).strip()
                        })
                    example_title = line.split(":", 1)[0].strip()
                    example_code = [line.split(":", 1)[1].strip()]
                elif example_title:
                    example_code.append(line)
            elif current_section == "learningPath" and line[:2].isdigit():
                step = line.split('.', 1)[1].strip()
                if step:
                    result["learningPath"].append(step)
        # Save last example
        if current_section == "examples" and example_title and example_code:
            result["examples"].append({
                "title": example_title,
                "code": "\n".join(example_code).strip()
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating explanation: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai_tutor_main:app", host="127.0.0.1", port=8000, reload=True)

# If you get import errors, run:
# pip install fastapi uvicorn pydantic python-dotenv groq