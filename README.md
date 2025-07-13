
# EMO_LEARN_NEXUS

![MIT License](https://img.shields.io/badge/license-MIT-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

EMO_LEARN_NEXUS is an advanced, emotion-aware learning platform that adapts to users' emotional states in real time using facial, speech, and mouse emotion detection. It delivers personalized feedback, interactive games, and AI-powered tutoring to create a truly engaging and supportive learning environment.

<p align="center">
  <b>Empowering learning through emotion recognition and AI.</b>
</p>

## Features
- 🎭 Real-time emotion detection (facial, speech, mouse)
- 🤖 AI-powered tutor and assistant
- 🎮 Interactive games and exercises
- 📈 Mood tracking and visualization
- 📹 YouTube summarizer and video player
- 🏅 Progress badges and motivational quotes
- 💻 Modern, responsive frontend (React + Vite + Tailwind)
- 🐍 Python backend with FastAPI and AI modules

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Python, FastAPI
- **AI/ML:** Custom emotion detection modules (facial, speech, mouse)

## Folder Structure
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


## Getting Started

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


## Usage
- Start both backend and frontend servers as described above.
- Open the frontend in your browser.
- Interact with the AI tutor, play games, and track your mood.
- Use the YouTube summarizer for quick video insights.
- Check the mood graph and progress badges for motivation.
## Screenshots

<!-- Uncomment and add screenshots/gifs here -->
<!--
![Home Page](screenshots/home.png)
![AI Tutor](screenshots/tutor.png)
-->

## Documentation

- [Backend API Docs](http://localhost:8000/docs) (when backend is running)
- [Frontend Source](./src/)
- [Backend Source](./backend/)

## FAQ

**Q: How does emotion detection work?**
A: The backend uses AI models to analyze facial expressions, speech, and mouse activity to infer user emotions in real time.

**Q: Is my data private?**
A: Emotion logs are stored locally and are not shared unless you choose to.

**Q: Can I contribute new games or features?**
A: Yes! See the Contributing section below.



## Contributing
We welcome contributions! To get started:
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

Please read our [contribution guidelines](CONTRIBUTING.md) (if available).


## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


## Contact & Acknowledgments

For questions or support, open an issue or contact the maintainer.

Special thanks to all contributors and the open-source community!
