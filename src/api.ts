const API_BASE = 'http://localhost:3001/api';

export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ScoreEntry {
  score: number;
  played_at: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error('Cannot connect to server. Is the API server running? (npm run dev:server)');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export function signup(username: string, password: string): Promise<AuthResponse> {
  return request('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export function signin(username: string, password: string): Promise<AuthResponse> {
  return request('/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export function saveScore(token: string, score: number): Promise<{ success: boolean }> {
  return request('/scores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score }),
  });
}

export function getScores(token: string): Promise<ScoreEntry[]> {
  return request('/scores', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
