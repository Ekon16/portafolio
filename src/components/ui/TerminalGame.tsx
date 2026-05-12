import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Terminal as TerminalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRID_WIDTH = 25;
const GRID_HEIGHT = 15;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'IDLE' | 'INSTALLING' | 'MENU' | 'PLAYING' | 'GAMEOVER';

export function TerminalGame() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>('RIGHT'); // To prevent multiple turns per tick

  const startedRef = useRef(false);

  // Initialize installation sequence
  useEffect(() => {
    if (gameState === 'IDLE' && !startedRef.current) {
      startedRef.current = true;
      const installSequence = async () => {
        const addLog = (text: string) => setLogs(prev => [...prev, text]);
        
        await new Promise(r => setTimeout(r, 500));
        addLog("> npm install jose-ignacio");
        await new Promise(r => setTimeout(r, 800));
        addLog("Installing packages...");
        await new Promise(r => setTimeout(r, 600));
        addLog("✔ Core modules loaded");
        await new Promise(r => setTimeout(r, 600));
        addLog("✔ Experience initialized");
        await new Promise(r => setTimeout(r, 600));
        addLog("✔ Creativity optimized");
        await new Promise(r => setTimeout(r, 800));
        addLog("Package installed successfully.");
        addLog("Type 'npm run game' to start.");
        setGameState('MENU');
      };
      installSequence();
    }
  }, [gameState]);

  // Game Loop
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (directionRef.current) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collisions
      if (
        newHead.x < 0 || newHead.x >= GRID_WIDTH ||
        newHead.y < 0 || newHead.y >= GRID_HEIGHT ||
        prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameState('GAMEOVER');
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      gameLoopRef.current = setInterval(moveSnake, Math.max(50, INITIAL_SPEED - score * 2));
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, moveSnake, score]);

  const generateFood = (currentSnake: Point[]) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameState('PLAYING');
    generateFood([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  };

  const changeDirection = (newDir: Direction) => {
    const currentDir = directionRef.current;
    if (newDir === 'UP' && currentDir === 'DOWN') return;
    if (newDir === 'DOWN' && currentDir === 'UP') return;
    if (newDir === 'LEFT' && currentDir === 'RIGHT') return;
    if (newDir === 'RIGHT' && currentDir === 'LEFT') return;
    
    setDirection(newDir);
    directionRef.current = newDir;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      
      switch (e.key) {
        case 'ArrowUp': changeDirection('UP'); e.preventDefault(); break;
        case 'ArrowDown': changeDirection('DOWN'); e.preventDefault(); break;
        case 'ArrowLeft': changeDirection('LEFT'); e.preventDefault(); break;
        case 'ArrowRight': changeDirection('RIGHT'); e.preventDefault(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Update high score
  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <div className="flex flex-col h-full w-full bg-black/90 text-green-500 font-mono text-sm p-4 rounded-b-xl relative overflow-hidden min-h-[350px]">
      
      {/* Installation Logs / Menu */}
      {(gameState === 'IDLE' || gameState === 'MENU') && (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className={cn(
              "break-words",
              log.startsWith(">") ? "text-yellow-400" : 
              log.includes("✔") ? "text-emerald-400" : "text-gray-300"
            )}>
              {log}
            </div>
          ))}
          {gameState === 'MENU' && (
            <div className="mt-4 animate-pulse">
              <span className="text-emerald-500">➜</span> 
              <span className="text-blue-400 mx-2">~</span>
              <button 
                onClick={startGame}
                className="hover:bg-green-500/20 px-2 py-1 rounded text-white font-bold border border-green-500/50"
              >
                npm run game
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game Area */}
      {(gameState === 'PLAYING' || gameState === 'GAMEOVER') && (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="flex justify-between w-full max-w-[300px] mb-2 text-xs uppercase tracking-wider">
            <span>Score: {score}</span>
            <span>High Score: {highScore}</span>
          </div>
          
          <div 
            className="relative bg-black border border-green-500/30"
            style={{ 
              width: '100%', 
              maxWidth: '300px',
              aspectRatio: `${GRID_WIDTH}/${GRID_HEIGHT}` 
            }}
          >
            {/* Snake */}
            {snake.map((segment, i) => (
              <div
                key={i}
                className="absolute bg-green-500"
                style={{
                  left: `${(segment.x / GRID_WIDTH) * 100}%`,
                  top: `${(segment.y / GRID_HEIGHT) * 100}%`,
                  width: `${100 / GRID_WIDTH}%`,
                  height: `${100 / GRID_HEIGHT}%`,
                  opacity: i === 0 ? 1 : 0.7,
                  borderRadius: '2px'
                }}
              />
            ))}
            
            {/* Food */}
            <div
              className="absolute bg-red-500 animate-pulse rounded-full"
              style={{
                left: `${(food.x / GRID_WIDTH) * 100}%`,
                top: `${(food.y / GRID_HEIGHT) * 100}%`,
                width: `${100 / GRID_WIDTH}%`,
                height: `${100 / GRID_HEIGHT}%`,
                transform: 'scale(0.8)'
              }}
            />

            {gameState === 'GAMEOVER' && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
                <div className="text-red-500 font-bold text-xl mb-2">GAME OVER</div>
                <div className="text-white mb-4">Score: {score}</div>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <button 
                  onClick={() => setGameState('MENU')}
                  className="mt-2 text-xs text-gray-400 hover:text-white underline"
                >
                  Exit to Terminal
                </button>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="grid grid-cols-3 gap-2 mt-4 md:hidden w-full max-w-[200px]">
            <div />
            <button 
              className="p-3 bg-gray-800 rounded-lg active:bg-green-900 flex items-center justify-center"
              onPointerDown={(e) => { e.preventDefault(); changeDirection('UP'); }}
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            <div />
            
            <button 
              className="p-3 bg-gray-800 rounded-lg active:bg-green-900 flex items-center justify-center"
              onPointerDown={(e) => { e.preventDefault(); changeDirection('LEFT'); }}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button 
              className="p-3 bg-gray-800 rounded-lg active:bg-green-900 flex items-center justify-center"
              onPointerDown={(e) => { e.preventDefault(); changeDirection('DOWN'); }}
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <button 
              className="p-3 bg-gray-800 rounded-lg active:bg-green-900 flex items-center justify-center"
              onPointerDown={(e) => { e.preventDefault(); changeDirection('RIGHT'); }}
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Hint */}
          <div className="hidden md:block mt-4 text-xs text-gray-500">
            Use Arrow Keys to move
          </div>
        </div>
      )}
    </div>
  );
}
