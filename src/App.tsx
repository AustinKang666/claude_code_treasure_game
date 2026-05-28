import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import keyIcon from './assets/key.png';
import AuthScreen from './components/AuthScreen';
import ScoreHistory from './components/ScoreHistory';
import { saveScore, type User, type AuthResponse } from './api';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

interface AuthState {
  user: User;
  token: string;
}

function createBoxes(): Box[] {
  const treasureIndex = Math.floor(Math.random() * 3);
  return Array.from({ length: 3 }, (_, i) => ({
    id: i,
    isOpen: false,
    hasTreasure: i === treasureIndex,
  }));
}

function loadStoredAuth(): AuthState | null {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) return { token, user: JSON.parse(userStr) };
  } catch {}
  return null;
}

export default function App() {
  // Auth state — lazy-initialized from localStorage to avoid a flash on reload
  const [auth, setAuth] = useState<AuthState | null>(loadStoredAuth);
  const [isGuest, setIsGuest] = useState(false);

  // Game state — pre-initialized if a stored session exists
  const [boxes, setBoxes] = useState<Box[]>(() => (loadStoredAuth() ? createBoxes() : []));
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showKeyCursor, setShowKeyCursor] = useState(false);

  const isAuthenticated = auth !== null || isGuest;

  const initializeGame = () => {
    setBoxes(createBoxes());
    setScore(0);
    setGameEnded(false);
  };

  const handleAuth = (response: AuthResponse) => {
    const authState = { token: response.token, user: response.user };
    setAuth(authState);
    setIsGuest(false);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    initializeGame();
  };

  const handleGuest = () => {
    setAuth(null);
    setIsGuest(true);
    initializeGame();
  };

  const handleSignOut = () => {
    setAuth(null);
    setIsGuest(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setBoxes([]);
    setGameEnded(false);
  };

  const openBox = (boxId: number) => {
    if (gameEnded) return;
    const box = boxes.find(b => b.id === boxId);
    if (!box || box.isOpen) return;

    new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();

    // Compute all changes before touching state
    const newScore = box.hasTreasure ? score + 150 : score - 50;
    const newBoxes = boxes.map(b => b.id === boxId ? { ...b, isOpen: true } : b);
    const treasureFound = newBoxes.some(b => b.isOpen && b.hasTreasure);
    const allOpened = newBoxes.every(b => b.isOpen);
    const isEnded = treasureFound || allOpened;

    setBoxes(newBoxes);
    setScore(newScore);
    if (isEnded) {
      setGameEnded(true);
      if (auth) saveScore(auth.token, newScore).catch(console.error);
    }
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuth={handleAuth} onGuest={handleGuest} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      {/* User badge + sign-out */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="text-amber-700 text-sm">
          {auth ? `👤 ${auth.user.username}` : '🎭 Guest'}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={handleSignOut}
        >
          {auth ? 'Sign Out' : 'Sign In'}
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$150 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
        </div>
        {gameEnded && (
          <div className={`text-2xl font-bold px-4 py-2 rounded-lg border-2 ${
            score > 0
              ? 'bg-green-100 text-green-700 border-green-400'
              : score === 0
              ? 'bg-yellow-100 text-yellow-700 border-yellow-400'
              : 'bg-red-100 text-red-700 border-red-400'
          }`}>
            {score > 0 ? 'WIN' : score === 0 ? 'TIE' : 'LOSS'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={{ cursor: 'none' }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
            onMouseEnter={(e) => { setShowKeyCursor(true); setMousePos({ x: e.clientX, y: e.clientY }); }}
            onMouseLeave={() => setShowKeyCursor(false)}
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="relative"
            >
              <img
                src={box.isOpen ? (box.hasTreasure ? treasureChest : skeletonChest) : closedChest}
                alt={box.isOpen ? (box.hasTreasure ? 'Treasure!' : 'Skeleton!') : 'Treasure Chest'}
                className="w-48 h-48 object-contain drop-shadow-lg"
              />
              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>
            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$150' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">Click to open!</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center flex flex-col items-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score:{' '}
              <span className={score >= 0 ? 'text-green-600' : 'text-red-600'}>${score}</span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(b => b.isOpen && b.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {auth && <p className="text-xs text-amber-500 mt-1">Score saved ✓</p>}
          </div>

          <Button
            onClick={initializeGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white mb-4"
          >
            Play Again
          </Button>

          {auth && <ScoreHistory token={auth.token} />}
        </motion.div>
      )}

      {showKeyCursor && (
        <img
          src={keyIcon}
          alt=""
          className="fixed pointer-events-none z-50 w-8 h-8"
          style={{ left: mousePos.x - 16, top: mousePos.y - 16 }}
        />
      )}
    </div>
  );
}
