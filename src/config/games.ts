// games.ts - Configuration file for games
// Updated with actual games from your friend's EmoLearn Game Hub

export interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  gameUrl: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  emotion: string;
}

export const games: Game[] = [
  // Boredom Games
  {
    id: 'emoji-doodle',
    title: 'Emoji Doodle',
    description: 'Create fun doodles with emojis to beat boredom',
    gameUrl: 'boredom/emoji-doodle',
    category: 'Creative',
    difficulty: 'Easy',
    emotion: 'Boredom'
  },
  {
    id: 'story-spinner',
    title: 'Story Spinner',
    description: 'Spin and create random stories to spark creativity',
    gameUrl: 'boredom/story-spinner',
    category: 'Creative',
    difficulty: 'Easy',
    emotion: 'Boredom'
  },
  {
    id: 'puzzle-pop',
    title: 'Puzzle Pop',
    description: 'Pop the bubbles in the right order to solve puzzles',
    gameUrl: 'boredom/puzzle-pop',
    category: 'Puzzle',
    difficulty: 'Medium',
    emotion: 'Boredom'
  },

  // Confusion Games
  {
    id: 'line-shuffle',
    title: 'Line Shuffle',
    description: 'Arrange code lines in correct order to understand structure',
    gameUrl: 'confusion/line-shuffle',
    category: 'Programming',
    difficulty: 'Medium',
    emotion: 'Confusion'
  },
  {
    id: 'concept-match',
    title: 'Concept Match',
    description: 'Match related programming concepts to build understanding',
    gameUrl: 'confusion/concept-match',
    category: 'Programming',
    difficulty: 'Medium',
    emotion: 'Confusion'
  },
  {
    id: 'time-to-solve',
    title: 'Time To Solve',
    description: 'Solve puzzles against the clock to improve focus',
    gameUrl: 'confusion/time-to-solve',
    category: 'Puzzle',
    difficulty: 'Hard',
    emotion: 'Confusion'
  },

  // Fatigue Games
  {
    id: 'quick-match',
    title: 'Quick Match',
    description: 'Fast-paced matching game to boost energy',
    gameUrl: 'fatigue/quick-match',
    category: 'Reflex',
    difficulty: 'Easy',
    emotion: 'Fatigue'
  },
  {
    id: 'reflex-dash',
    title: 'Reflex Dash',
    description: 'Test your reflexes and reaction time',
    gameUrl: 'fatigue/reflex-dash',
    category: 'Reflex',
    difficulty: 'Medium',
    emotion: 'Fatigue'
  },
  {
    id: 'juice-it-up',
    title: 'Juice It Up',
    description: 'Energize with fun challenges and activities',
    gameUrl: 'fatigue/juice-it-up',
    category: 'Energy',
    difficulty: 'Easy',
    emotion: 'Fatigue'
  },

  // Frustration Games
  {
    id: 'smash-the-bug',
    title: 'Smash The Bug',
    description: 'Find and eliminate bugs to relieve frustration',
    gameUrl: 'frustration/smash-the-bug',
    category: 'Programming',
    difficulty: 'Medium',
    emotion: 'Frustration'
  },
  {
    id: 'laugh-trivia',
    title: 'Laugh Trivia',
    description: 'Fun programming trivia to lighten the mood',
    gameUrl: 'frustration/laugh-trivia',
    category: 'Trivia',
    difficulty: 'Easy',
    emotion: 'Frustration'
  },
  {
    id: 'arrange-the-code',
    title: 'Arrange The Code',
    description: 'Organize code blocks properly to build confidence',
    gameUrl: 'frustration/arrange-the-code',
    category: 'Programming',
    difficulty: 'Hard',
    emotion: 'Frustration'
  }
];

// Instructions for integration:
// 1. These games are designed for different emotional states (Boredom, Confusion, Fatigue, Frustration)
// 2. Each game has a specific URL path that should be integrated with your friend's game server
// 3. The games are categorized by emotion and type (Creative, Programming, Puzzle, Reflex, Energy, Trivia)
// 4. Difficulty levels are based on the game complexity and learning objectives

// To integrate with your friend's game server:
// 1. Replace the gameUrl paths with the actual server URLs
// 2. Example: 'boredom/emoji-doodle' → 'https://your-friend-server.com/boredom/emoji-doodle'
// 3. Make sure the game server is running and accessible
// 4. Test each game URL to ensure they work correctly

// Example of how to update with actual server URLs:
/*
{
  id: 'emoji-doodle',
  title: 'Emoji Doodle',
  description: 'Create fun doodles with emojis to beat boredom',
  gameUrl: 'https://your-friend-game-server.com/boredom/emoji-doodle', // ← Replace with actual URL
  category: 'Creative',
  difficulty: 'Easy',
  emotion: 'Boredom'
}
*/ 