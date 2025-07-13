// gameServer.ts - Configuration for your friend's game server

// Use the current origin for the backend base URL
export const GAME_SERVER_CONFIG = {
  BASE_URL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000',
  
  // Alternative URLs (uncomment and use the correct one):
  // BASE_URL: 'https://your-friend-game-server.com',
  // BASE_URL: 'http://localhost:3000',
  // BASE_URL: 'https://emolearn-games.vercel.app',
  
  // Game server status
  IS_DEVELOPMENT: true, // Set to false in production
  
  // Fallback URL if game server is not available
  FALLBACK_URL: 'https://github.com/your-friend/emolearn-games',
  
  // Timeout for game loading (in milliseconds)
  LOAD_TIMEOUT: 10000,
};

// Instructions for updating the game server URL:
// 1. Ask your friend for the correct server URL where their games are hosted
// 2. Update the BASE_URL above with the correct URL
// 3. Make sure the server is running and accessible
// 4. Test the games to ensure they load correctly

// Example URLs:
// - Local development: 'http://localhost:8000'
// - Vercel deployment: 'https://emolearn-games.vercel.app'
// - Netlify deployment: 'https://emolearn-games.netlify.app'
// - Custom domain: 'https://games.yourdomain.com'

export const getGameUrl = (gamePath: string): string => {
  // Remove the leading slash if present and add /games prefix
  const cleanPath = gamePath.startsWith('/') ? gamePath.slice(1) : gamePath;
  return `${GAME_SERVER_CONFIG.BASE_URL}/games/${cleanPath}`;
};

export const getFallbackUrl = (): string => {
  return GAME_SERVER_CONFIG.FALLBACK_URL;
}; 