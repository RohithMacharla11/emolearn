import dotenv from 'dotenv';
dotenv.config();

export const GROQ_API_KEY = process.env.GROQ_API_KEY as string;

export const GROQ_CONFIG = {
  apiKey: GROQ_API_KEY,
  model: "llama3-8b-8192",
  maxTokens: 2000,
  temperature: 0.7,
  topP: 0.9,
};
