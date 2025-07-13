import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaPlay, FaPause, FaBrain, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import quotesData from "./quotes.json";
import loFiMusic from "../assets/lofi.mp3";

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ isOpen, onClose }) => {
  const [quotes, setQuotes] = useState<string[]>(quotesData);
  const [newQuote, setNewQuote] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameMessage, setGameMessage] = useState("Test your reflexes");
  const [waiting, setWaiting] = useState(false);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [timer, setTimer] = useState(120);
  const [quote, setQuote] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      setTimer(120);
      setIsPlaying(false);
      setGameStarted(false);
      setGameMessage("Test your reflexes");
      setReactionTime(null);
      audioRef.current?.pause();
    }
  }, [isOpen, quotes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const startGame = () => {
    setReactionTime(null);
    setGameStarted(true);
    setWaiting(true);
    setGameMessage("Wait for green...");

    const delay = Math.random() * 2000 + 2000;
    setTimeout(() => {
      setGameMessage("CLICK NOW!");
      setWaiting(false);
      setStartTime(performance.now());
    }, delay);
  };

  const clickGame = () => {
    if (!gameStarted) return;
    if (waiting) {
      setGameMessage("Too early!");
      setGameStarted(false);
    } else if (startTime) {
      const rt = performance.now() - startTime;
      setReactionTime(rt);
      setGameMessage(`Your time: ${rt.toFixed(0)} ms`);
      setGameStarted(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const saveQuote = () => {
    if (newQuote.trim()) {
      if (editingIndex !== null) {
        setQuotes((q) => q.map((qt, i) => (i === editingIndex ? newQuote.trim() : qt)));
        setEditingIndex(null);
      } else {
        setQuotes((q) => [...q, newQuote.trim()]);
      }
      setNewQuote("");
    }
  };

  const deleteQuote = (i: number) => setQuotes((q) => q.filter((_, index) => index !== i));
  const editQuote = (i: number) => {
    setNewQuote(quotes[i]);
    setEditingIndex(i);
  };
  const restart = () => {
    setTimer(120);
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setGameStarted(false);
    setReactionTime(null);
    setGameMessage("Test your reflexes");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center p-4 text-white z-50 overflow-auto backdrop-blur-md">
      <div className="flex w-full justify-between mb-4">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">🧠 Brain Reset</h2>
        <button onClick={onClose} className="text-2xl hover:text-red-400"><FaArrowLeft title="Back" /></button>
      </div>

      <motion.div
        onClick={togglePlay}
        className="w-16 h-16 bg-indigo-500 flex items-center justify-center rounded-full shadow-xl cursor-pointer mb-4"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ repeat: isPlaying ? Infinity : 0, duration: 2 }}
      >
        {isPlaying ? <FaPause size={28} /> : <FaPlay size={28} />}
      </motion.div>
      <audio ref={audioRef} src={loFiMusic} loop />

      <div className="w-28 h-28 border-4 border-blue-500 rounded-full flex items-center justify-center mb-4">
        <span className="text-xl font-mono">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span>
      </div>

      <div className="bg-indigo-900 p-4 rounded-xl w-full max-w-xl text-center mb-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-2 text-blue-200">✨ Motivation</h3>
        <p className="italic">"{quote}"</p>
      </div>

      <motion.div
        onClick={clickGame}
        className={`bg-gray-800 p-4 w-full max-w-xl text-center mb-2 cursor-pointer rounded-xl ${
          gameMessage === "CLICK NOW!" ? "bg-green-500" : ""
        }`}
        whileTap={{ scale: 0.98 }}
      >
        <p className="text-xl mb-2">{gameMessage}</p>
        {!gameStarted && (
          <button onClick={startGame} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
            Start Reflex Test
          </button>
        )}
        {reactionTime && <p className="text-green-400">Your time: {reactionTime?.toFixed(0)} ms</p>}
      </motion.div>

      <div className="bg-indigo-900 p-4 rounded-xl w-full max-w-xl mb-4 shadow-xl">
        <h4 className="flex items-center justify-center gap-2 mb-2"><FaEdit /> Manage Quotes</h4>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 p-2 bg-gray-800 rounded"
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            placeholder="Add new quote..."
          />
          <button onClick={saveQuote} className="bg-green-600 px-3 rounded hover:bg-green-700">
            <FaPlus />
          </button>
        </div>
        <ul className="max-h-32 overflow-y-auto space-y-1">
          {quotes.map((q, i) => (
            <li key={i} className="flex justify-between items-center bg-gray-800 px-2 py-1 rounded">
              <span>{q}</span>
              <span className="flex gap-2">
                <button onClick={() => editQuote(i)} className="hover:text-blue-400">
                  <FaEdit />
                </button>
                <button onClick={() => deleteQuote(i)} className="hover:text-red-400">
                  <FaTrash />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={onClose} className="p-3 bg-blue-600 rounded-full shadow hover:bg-blue-700"><FaArrowLeft title="Back" /></button>
        <button onClick={restart} className="p-3 bg-green-600 rounded-full shadow hover:bg-green-700"><FaBrain title="Restart Timer & Game" /></button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-purple-600 rounded-full shadow hover:bg-purple-700"><FaPlay title="Play/Pause Music" /></button>
      </div>
    </div>
  );
};

export default BreathingExercise;
