import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Maximize, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef<HTMLDivElement>(null);

  // Sample video playlist - you can replace with your actual videos
  const videos = [
    {
      id: 'tgbNymZ7vqY',
      title: 'Neural Networks Fundamentals',
      chapter: 'Chapter 3: Deep Learning Architectures'
    },
    {
      id: '3JZ_D3ELwOQ', 
      title: 'Machine Learning Basics',
      chapter: 'Chapter 1: Introduction to ML'
    },
    {
      id: 'kXYiU_JCYtU',
      title: 'Data Science Essentials',
      chapter: 'Chapter 2: Data Preprocessing'
    }
  ];

  const requestFullScreen = (element: HTMLElement) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (videoRef.current) {
        requestFullScreen(videoRef.current);
      }
    } else {
      exitFullScreen();
    }
  };

  const handleFullScreenChange = () => {
    const isFS =
      document.fullscreenElement === videoRef.current ||
      (document as any).webkitFullscreenElement === videoRef.current ||
      (document as any).mozFullScreenElement === videoRef.current ||
      (document as any).msFullscreenElement === videoRef.current;

    setIsFullScreen(!!isFS);
  };

  const nextVideo = () => {
    if (isFullScreen) return;
    setVideoIndex((videoIndex + 1) % videos.length);
  };

  const prevVideo = () => {
    if (isFullScreen) return;
    setVideoIndex((videoIndex - 1 + videos.length) % videos.length);
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullScreenChange);
    };
  }, []);

  return (
    <div className="relative group flex flex-col items-center">
      <div
        className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl w-full ${isFullScreen ? 'fixed inset-0 z-50 rounded-none flex flex-col items-center justify-center' : ''}`}
        ref={videoRef}
      >
        {/* Video Info Overlay */}
        <div className="absolute top-4 left-4 text-white z-30">
          <h3 className="text-xl font-semibold">{videos[videoIndex].title}</h3>
          <p className="text-blue-200">{videos[videoIndex].chapter}</p>
        </div>
        {/* YouTube iframe for actual video */}
        <div className="aspect-video w-full relative">
          <iframe
            className="w-full h-full absolute inset-0"
            src={`https://www.youtube.com/embed/${videos[videoIndex].id}?autoplay=1&controls=1&modestbranding=1&rel=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: isFullScreen ? 0 : '1.5rem', background: 'black' }}
          ></iframe>
          {/* Overlay to block interaction only in focus mode */}
          {isFullScreen && (
            <div className="absolute inset-0 bg-black/40 z-40 cursor-not-allowed"></div>
          )}
        </div>
        {/* Live Status */}
        <div className="absolute top-4 right-4 z-30">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        </div>
      </div>
      {/* Controls BELOW the video */}
      <div className="flex flex-col items-center w-full mt-4">
        {/* Video Navigation Dots */}
        {!isFullScreen && (
          <div className="flex space-x-2 mb-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => setVideoIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === videoIndex ? 'bg-blue-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
        <div className="flex gap-4 justify-center w-full">
          <Button
            onClick={prevVideo}
            variant="secondary"
            className="bg-blue-600 text-white hover:bg-blue-500"
            disabled={isFullScreen}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={nextVideo}
            variant="secondary"
            className="bg-blue-600 text-white hover:bg-blue-500"
            disabled={isFullScreen}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={toggleFullScreen}
            className={`text-white ${isFullScreen ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isFullScreen ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            Focus Mode
          </Button>
        </div>
      </div>
    </div>
  );
};
