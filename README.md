


<div align="center">
  <img src="https://raw.githubusercontent.com/RohithMacharla11/emolearn/main/public/logo.png" alt="EMO_LEARN_NEXUS Logo" width="120" />
  
  # EMO_LEARN_NEXUS
  
  <i>Transform Learning Through Emotion-Driven Innovation</i>
  
  <br>
<!--   <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"> -->
  <img src="https://img.shields.io/badge/typescript-77.3%25-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/languages-5-lightgrey" alt="Languages">
</div>

---

## 📑 Table of Contents
- [Overview](#overview)
- [Quickstart](#quickstart)
- [Features](#features)
- [Project Structure](#project-structure)
- [Project Index](#project-index)
- [Styling](#styling)
- [Contribution](#contribution)
- [Acknowledgements](#acknowledgements)

---

## 📝 Overview
EMO_LEARN_NEXUS is a cutting-edge, emotion-aware learning platform that adapts to users' emotional states in real time using facial, speech, and mouse emotion detection. It delivers personalized feedback, interactive games, and AI-powered tutoring to create a truly engaging and supportive learning environment. The platform is designed to foster motivation, improve learning outcomes, and make education more human-centric.

<div align="center">
  <b>Empowering learning through emotion recognition and AI.</b>
</div>

---

## ⚡ Quickstart

### Prerequisites
- [Node.js & npm](https://nodejs.org/) (for frontend)
- [Python 3.10+](https://www.python.org/) (for backend)

### Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Access the App
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)

---

## ✨ Features
- 🎭 Real-time emotion detection (facial, speech, mouse)
- 🤖 AI-powered tutor and assistant
- 🎮 Interactive games and exercises
- 📈 Mood tracking and visualization
- 📹 YouTube summarizer and video player
- 🏅 Progress badges and motivational quotes
- 💻 Modern, responsive frontend (React + Vite + Tailwind)
- 🐍 Python backend with FastAPI and AI modules

---

## 🏗️ Project Structure
```
emo-learn-nexus/
├── backend/           # Python backend (FastAPI, AI modules)
│   ├── modules/       # Emotion detection modules
│   ├── static/        # Static files (JS, CSS)
│   ├── templates/     # HTML templates
│   └── ...
├── public/            # Public assets
├── src/               # Frontend source code
│   ├── components/    # React components
│   ├── pages/         # App pages
│   ├── api/           # Frontend API calls
│   └── ...
├── .gitignore         # Git ignore rules
├── README.md          # Project documentation
└── ...
```

---

## 🗂️ Project Index
- **backend/**: Python backend, FastAPI server, emotion modules
- **src/**: Frontend React app, UI components, pages, API calls
- **public/**: Static assets (images, audio, etc.)
- **.gitignore**: Files/folders excluded from version control
- **README.md**: Project documentation

---

## 🎨 Styling
- Uses Tailwind CSS for rapid, modern UI development
- Easily customizable themes in `tailwind.config.ts`
- Responsive design for all devices
- Add your own styles in `src/App.css` or `src/components/voice.css`
- Supports dark mode and accessibility best practices

---

## 🤝 Contribution
We welcome contributions from everyone! To get started:
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

Please read our [contribution guidelines](CONTRIBUTING.md) (if available) for more details on how to contribute, code style, and review process.

<!-- ---

## 📜 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

--- -->

## 🙏 Acknowledgements
- Thanks to all contributors and the open-source community!
- Built with technologies: Flask, FastAPI, React, TypeScript, Tailwind, Python, NumPy, pandas, ESLint, Zod, Vite, Gunicorn, MediaPipe, Markdown, PostCSS, Autoprefixer, .env, JavaScript, datefns, React Hook Form

---
