import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Youtube, FileText, BookOpen, HelpCircle, Loader2, ArrowLeft } from 'lucide-react';
import { summarizeYouTubeVideo } from '@/api/youtubeSummarizer';

interface YouTubeSummarizerProps {
  onSummaryComplete: (summary: string) => void;
  onClose: () => void;
}

export const YouTubeSummarizer = ({ onSummaryComplete, onClose }: YouTubeSummarizerProps) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [summaryMode, setSummaryMode] = useState<'summary' | 'notes' | 'quiz'>('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const summary = await summarizeYouTubeVideo(videoUrl, summaryMode);
      onSummaryComplete(summary);
    } catch (err) {
      setError('Failed to summarize video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const summaryModes = [
    {
      mode: 'summary' as const,
      icon: FileText,
      title: 'Summary',
      description: 'Comprehensive overview',
      color: 'from-blue-400 to-blue-600'
    },
    {
      mode: 'notes' as const,
      icon: BookOpen,
      title: 'Study Notes',
      description: 'Detailed notes',
      color: 'from-green-400 to-green-600'
    },
    {
      mode: 'quiz' as const,
      icon: HelpCircle,
      title: 'Quiz',
      description: 'Test your knowledge',
      color: 'from-purple-400 to-purple-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <Youtube className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Summarize the Class</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Paste YouTube URL here..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="border-gray-200 focus:border-red-400"
        />
        
        <p className="text-xs text-gray-500 text-center">
          Paste any YouTube video URL to get a comprehensive summary, study notes, or quiz
        </p>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {summaryModes.map((mode) => (
            <Card
              key={mode.mode}
              onClick={() => setSummaryMode(mode.mode)}
              className={`p-3 cursor-pointer transition-all duration-200 border-2 ${
                summaryMode === mode.mode
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-red-200'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`w-8 h-8 bg-gradient-to-r ${mode.color} rounded-full flex items-center justify-center`}>
                  <mode.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-xs">{mode.title}</h4>
                  <p className="text-xs text-gray-600">{mode.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleSummarize}
            disabled={isLoading || !videoUrl.trim()}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Youtube className="w-4 h-4 mr-2" />
                Summarize Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}; 