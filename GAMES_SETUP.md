# 🎮 EmoLearn Games Setup Guide

This guide will help you set up and run the games in the EmoLearn project.

## 🚀 Quick Start

### 1. Start the Backend Server

The games are served from the backend server. You have two options to start it:

#### Option A: Using the startup script (Recommended)
```bash
python start_backend.py
```

#### Option B: Manual start
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Start the Frontend

In a new terminal, start the frontend:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

### 3. Access the Games

1. Open your browser and go to `http://localhost:5173`
2. Click on the AI Assistant (brain icon)
3. Click on the "Games" option
4. Select a game to play

## 🎯 Available Games

### Boredom Games
- **Emoji Doodle** 🎨 - Create fun doodles with emojis
- **Story Spinner** 📖 - Spin and create random stories
- **Puzzle Pop** 🧩 - Pop bubbles in the right order

### Confusion Games
- **Line Shuffle** 🔀 - Arrange code lines in correct order
- **Concept Match** 🔗 - Match related programming concepts
- **Time To Solve** ⏰ - Solve puzzles against the clock

### Fatigue Games
- **Quick Match** ⚡ - Fast-paced matching game
- **Reflex Dash** 🏃 - Test your reflexes
- **Juice It Up** 🥤 - Energize with fun challenges

### Frustration Games
- **Smash The Bug** 🐛 - Find and eliminate bugs
- **Laugh Trivia** 😄 - Fun programming trivia
- **Arrange The Code** 📝 - Organize code blocks properly

## 🔧 Troubleshooting

### Problem: "localhost refused to connect" error

**Solution:** Make sure the backend server is running on port 8000

1. Check if the server is running:
   ```bash
   curl http://localhost:8000/docs
   ```

2. If not running, start it:
   ```bash
   python start_backend.py
   ```

### Problem: Games not loading

**Solution:** Check the server logs for errors

1. Look at the terminal where the backend is running
2. Check for any error messages
3. Make sure all dependencies are installed:
   ```bash
   pip install -r backend/requirements.txt
   ```

### Problem: Frontend can't connect to backend

**Solution:** Check CORS settings and ports

1. Make sure frontend is running on port 5173
2. Make sure backend is running on port 8000
3. Check that CORS is properly configured in the backend

## 📁 File Structure

```
emo-learn-nexus/
├── backend/
│   ├── main.py              # Backend server with game routes
│   ├── requirements.txt     # Python dependencies
│   └── modules/            # Emotion detection modules
├── src/
│   ├── config/
│   │   ├── games.ts        # Game configurations
│   │   └── gameServer.ts   # Server URL configuration
│   └── components/
│       └── GamesSection.tsx # Games UI component
├── start_backend.py        # Backend startup script
└── GAMES_SETUP.md         # This file
```

## 🌐 Game URLs

Games are accessible at:
- `http://localhost:8000/games/boredom/emoji-doodle`
- `http://localhost:8000/games/confusion/line-shuffle`
- `http://localhost:8000/games/fatigue/quick-match`
- `http://localhost:8000/games/frustration/smash-the-bug`

## 🎨 Game Features

Each game includes:
- ✅ Beautiful UI with gradients and animations
- ✅ Back button for easy navigation
- ✅ Responsive design
- ✅ Error handling and loading states
- ✅ Score tracking
- ✅ Interactive gameplay

## 🔄 Adding New Games

To add a new game:

1. Add the game configuration to `src/config/games.ts`
2. Add the game implementation to the `games` dictionary in `backend/main.py`
3. Update the game icon in `src/components/GamesSection.tsx`

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the backend server logs
3. Make sure all dependencies are installed
4. Verify that both frontend and backend are running

## 🎉 Enjoy Playing!

The games are designed to help with different emotional states during learning:
- **Boredom**: Creative and engaging activities
- **Confusion**: Structured learning and problem-solving
- **Fatigue**: Quick, energizing challenges
- **Frustration**: Stress relief and confidence building

Happy learning! 🚀 