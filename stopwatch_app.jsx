import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Maximize2, Minimize2, Eye, EyeOff, Trash2, GripVertical } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// --- Stopwatch Component ---
// Now a presentational component, receiving all state and handlers as props
const Stopwatch = ({ 
  id, 
  totalTimers,
  label,
  isRunning, // PROP
  elapsedTime, // PROP
  onDelete, 
  onUpdateLabel,
  isZenMode,
  onToggle, // HANDLER
  onReset, // HANDLER
  handleDragStart, 
  handleDragDrop, 
  handleDragOver,
  isBeingDragged
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const toggleFocus = (e) => {
    e.stopPropagation();
    setIsFocused(!isFocused);
  };

  const deleteTimer = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    const sizeClasses = isFocused ? 
      "text-[18vw] sm:text-[12rem] font-medium" : 
      "text-[12vw] sm:text-[8rem] font-medium";
    const subSizeClasses = isFocused ? 
      "text-[9vw] sm:text-[6rem] text-slate-500 mx-1" : 
      "text-[6vw] sm:text-[4rem] text-slate-500 mx-1";
    const msSizeClasses = isFocused ? 
      "text-[6vw] sm:text-[4rem] font-light ml-2 w-[7vw] sm:w-[9rem] text-left" : 
      "text-[4vw] sm:text-[3rem] font-light ml-2 w-[5vw] sm:w-[6rem] text-left";

    return (
      <div className="flex items-baseline font-mono tracking-tighter leading-none select-none transition-all duration-500">
        <span className={sizeClasses + " text-slate-100"}>
          {minutes.toString().padStart(2, '0')}
        </span>
        <span className={subSizeClasses}>:</span>
        <span className={sizeClasses + " text-slate-100"}>
          {seconds.toString().padStart(2, '0')}
        </span>
        <span className={msSizeClasses}>
          .{milliseconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  const containerClasses = isFocused 
    ? "fixed inset-0 z-[60] bg-[#050505] flex flex-col items-center justify-center space-y-12"
    : `relative group flex flex-col items-center justify-center pt-20 pb-12 px-8 rounded-2xl transition-all duration-300 border w-full max-w-4xl mx-auto ${
        isRunning 
          ? 'bg-slate-900/50 border-slate-700 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]' 
          : 'bg-slate-900/20 border-slate-800 hover:border-slate-700'
      } ${isBeingDragged ? 'opacity-50 border-indigo-500 border-dashed' : ''}`;

  return (
    <div 
      className={containerClasses}
      draggable={!isFocused}
      onDragStart={(e) => handleDragStart(e, id)}
      onDragOver={(e) => handleDragOver(e, id)}
      onDrop={(e) => handleDragDrop(e, id)}
    >
      
      {/* 1. Header (Secondary Actions) */}
      <div 
        className={`flex justify-between items-center w-full absolute top-0 pt-6 px-6 transition-opacity duration-300 
          ${isFocused ? 'top-6' : ''} 
          ${(isZenMode && !isFocused) ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
        `}
      >
        
        {/* Left: Label Input (Normal Mode) */}
        {!isFocused && (
            <div className={`transition-all duration-300`}>
              <input
                type="text"
                value={label}
                onChange={(e) => onUpdateLabel(id, e.target.value)}
                placeholder="Timer Name"
                className={`bg-transparent text-left outline-none border-b border-transparent focus:border-indigo-500/50 transition-all text-slate-400 focus:text-indigo-400 text-lg placeholder:text-slate-700`}
              />
            </div>
        )}
        
        {/* Right: Secondary Actions */}
        <div className={`flex gap-2 items-center ml-auto ${isFocused ? 'absolute top-6 right-6' : ''}`}>
            
            {/* Drag Handle - Hidden in Focus Mode */}
            {!isFocused && totalTimers > 1 && (
                <div 
                  className="p-1 text-slate-700 hover:text-slate-400 transition-colors cursor-grab"
                  title="Drag to Reorder"
                >
                    <GripVertical size={20} />
                </div>
            )}

            {/* Delete Timer - Hidden in Focus Mode */}
            {!isFocused && totalTimers > 1 && (
                <button
                    onClick={deleteTimer}
                    className="p-1 rounded-full text-slate-700 hover:text-red-400 transition-colors"
                    title="Delete Timer"
                >
                    <Trash2 size={20} />
                </button>
            )}

            {/* Expand / Focus Toggle */}
            <button
                onClick={toggleFocus}
                className={`p-1 rounded-full transition-colors ${isFocused ? 'text-indigo-400 text-2xl' : 'text-slate-700 hover:text-indigo-400'}`}
                title={isFocused ? "Exit Focus" : "Focus Mode"}
            >
                {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={20} />}
            </button>
        </div>
      </div>
      
      {/* Center: Label Input (Focus Mode - Subtle and Closer) */}
      {isFocused && (
          <input
              type="text"
              value={label}
              onChange={(e) => onUpdateLabel(id, e.target.value)}
              placeholder="Timer Name"
              className="bg-transparent text-center outline-none border-b border-transparent focus:border-indigo-500/50 transition-all text-slate-500 text-2xl font-normal mb-[-2rem] sm:mb-[-4rem] max-w-full"
          />
      )}

      {/* Time Display Area - Clickable to toggle */}
      <div 
        onClick={() => onToggle(id)} // Use App handler
        className="cursor-pointer transition-transform duration-200 active:scale-95"
      >
        {formatTime(elapsedTime)}
      </div>

      {/* 2. Footer (Primary Actions: Stop/Play/Pause) */}
      <div 
        className={`flex gap-4 transition-all duration-300 justify-center 
          ${isFocused 
            ? 'mt-12 scale-150'
            : `mt-6 ${isZenMode ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`
          }
        `}
      >
        
        {/* Stop (Left) */}
        <button
          onClick={() => onReset(id)} // Use App handler
          className="p-4 rounded-full bg-slate-800 text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-all duration-200"
          title="Stop & Reset"
        >
          <Square size={24} fill="currentColor" />
        </button>

        {/* Play/Pause (Right) */}
        <button
          onClick={() => onToggle(id)} // Use App handler
          className={`p-4 rounded-full transition-all duration-200 ${
            isRunning 
              ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
          }`}
          title={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
};

// --- App Component ---
const App = () => {
  // --- Firebase/Auth/State Management ---
  const [timers, setTimers] = useState([]);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Global app states
  const [isZenMode, setIsZenMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const containerRef = useRef(null);
  const saveDebounceTimeout = useRef(null);

  // Global variables provided by Canvas environment
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
  
  // 1. Firebase Initialization and Authentication
  useEffect(() => {
    if (!firebaseConfig) return;

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const firebaseAuth = getAuth(app);
    
    // setLogLevel('Debug'); // Uncomment for debugging

    setDb(firestore);
    setAuth(firebaseAuth);

    const authenticate = async () => {
        try {
            if (initialAuthToken) {
                await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
                await signInAnonymously(firebaseAuth);
            }
        } catch (error) {
            console.error("Firebase Auth Error, attempting anonymous sign-in:", error);
            try {
                await signInAnonymously(firebaseAuth);
            } catch (anonError) {
                console.error("Anonymous Sign-in Failed:", anonError);
            }
        }
    };

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
            setUserId(user.uid);
        } else {
            // Fallback userId if anonymous sign-in failed (should be rare)
            setUserId(crypto.randomUUID()); 
        }
        setIsAuthReady(true);
    });

    authenticate();
    return () => unsubscribe();
  }, [firebaseConfig, initialAuthToken]);

  // Firestore Document Reference Getter
  const getTimerDocRef = (firestore, currentUserId) => {
    return doc(firestore, 'artifacts', appId, 'users', currentUserId, 'timer_data', 'main_state');
  };

  // 2. Data Saving Logic
  const saveTimers = async (currentTimers, currentUserId) => {
    if (!db || !currentUserId || isLoading) return;

    const timerDocRef = getTimerDocRef(db, currentUserId);
    
    // Prepare timers for saving: 
    // If running, calculate accumulated time and set isRunning to false for persistence safety.
    const safeTimersToSave = currentTimers.map(t => {
        if (t.isRunning) {
            const timeElapsedSinceUpdate = Date.now() - t.lastUpdateTime;
            return {
                ...t,
                isRunning: false, // Save as stopped
                elapsedTime: t.elapsedTime + timeElapsedSinceUpdate,
                lastUpdateTime: Date.now(), // New save timestamp
            };
        }
        return t;
    });

    try {
        // Use setDoc to replace the document content (timers array)
        await setDoc(timerDocRef, { timers: safeTimersToSave }, { merge: false });
    } catch (error) {
        console.error("Error saving timers:", error);
    }
  };

  // 3. Real-time Load & Drift Fix
  useEffect(() => {
    if (!db || !userId || !isAuthReady) return;

    const timerDocRef = getTimerDocRef(db, userId);

    const unsubscribe = onSnapshot(timerDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().timers) {
        let loadedTimers = docSnap.data().timers || [];

        // Apply Drift Fix to running timers on load
        const now = Date.now();
        const resumedTimers = loadedTimers.map(timer => {
          if (timer.isRunning && timer.lastUpdateTime) {
            const drift = now - timer.lastUpdateTime;
            
            // Resume the timer accurately
            return {
              ...timer,
              elapsedTime: timer.elapsedTime + drift,
              lastUpdateTime: now, // Reset lastUpdateTime for the new tick cycle
            };
          }
          // Ensure lastUpdateTime is set for future calculations/saves
          return { ...timer, lastUpdateTime: now };
        });

        setTimers(resumedTimers);

      } else if (isLoading) {
        // Initialize with default timer if no data exists
        setTimers([{ 
          id: 1, 
          label: 'First Timer', 
          isRunning: false, 
          elapsedTime: 0, 
          lastUpdateTime: Date.now() 
        }]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to timers:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, userId, isAuthReady, isLoading]);


  // 4. Persistence Trigger (Debounce saving)
  useEffect(() => {
    if (isLoading || !isAuthReady) return;

    if (saveDebounceTimeout.current) {
      clearTimeout(saveDebounceTimeout.current);
    }

    // Debounce save to reduce Firestore writes, especially during drag/tick cycles
    saveDebounceTimeout.current = setTimeout(() => {
        // Ensure we save the currently running state before pausing it for persistence
        saveTimers(timers, userId);
    }, 500); // 500ms debounce

    return () => clearTimeout(saveDebounceTimeout.current);
  }, [timers, isLoading, isAuthReady, userId]);

  // 5. Timer Tick Loop (Local Animation Frame for Smooth Display)
  useEffect(() => {
    let animationFrameId;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      setTimers(prevTimers => {
        let updatedTimers = false;
        const nextTimers = prevTimers.map(t => {
          if (t.isRunning) {
            updatedTimers = true;
            return {
              ...t,
              elapsedTime: t.elapsedTime + delta,
              lastUpdateTime: now,
            };
          }
          return t;
        });
        return updatedTimers ? nextTimers : prevTimers;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Only start animation loop if at least one timer is running
    if (timers.some(t => t.isRunning)) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [timers]);


  // --- App Action Handlers (Update State) ---

  const addTimer = () => {
    const newId = timers.length > 0 ? Math.max(...timers.map(t => t.id)) + 1 : 1;
    setTimers(prevTimers => [...prevTimers, { 
      id: newId, 
      label: `Timer ${newId}`, 
      isRunning: false, 
      elapsedTime: 0, 
      lastUpdateTime: Date.now() 
    }]);
  };

  const removeTimer = (id) => {
    if (timers.length === 1) return;
    setTimers(timers.filter(t => t.id !== id));
  };

  const updateLabel = (id, newLabel) => {
    setTimers(prevTimers => prevTimers.map(t => t.id === id ? { ...t, label: newLabel } : t));
  };

  const handleToggle = (id) => {
    const now = Date.now();
    setTimers(prevTimers => prevTimers.map(t => {
      if (t.id === id) {
        const newRunningState = !t.isRunning;
        
        if (newRunningState) {
          // Starting: Just set running and update tick time
          return { ...t, isRunning: newRunningState, lastUpdateTime: now };
        } else {
          // Pausing: Calculate and add time since last tick
          const timeElapsedSinceUpdate = now - t.lastUpdateTime;
          return { ...t, isRunning: newRunningState, elapsedTime: t.elapsedTime + timeElapsedSinceUpdate, lastUpdateTime: now };
        }
      }
      return t;
    }));
  };

  const handleReset = (id) => {
    setTimers(prevTimers => prevTimers.map(t => 
      t.id === id ? { ...t, isRunning: false, elapsedTime: 0, lastUpdateTime: Date.now() } : t
    ));
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    const sourceId = draggedId;

    if (sourceId === targetId || sourceId === null) return;

    setTimers(prevTimers => {
        const sourceIndex = prevTimers.findIndex(t => t.id === sourceId);
        const targetIndex = prevTimers.findIndex(t => t.id === targetId);

        if (sourceIndex === targetIndex || sourceIndex === -1 || targetIndex === -1) return prevTimers;

        const newTimers = [...prevTimers];
        const [movedItem] = newTimers.splice(sourceIndex, 1);
        newTimers.splice(targetIndex, 0, movedItem);

        // This update triggers the persistence effect
        return newTimers;
    });
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    setDraggedId(null);
  };

  // --- UI Handlers ---

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // --- Rendering ---

  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-400">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading Timers...
        </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-slate-700 overflow-y-auto"
    >
      {/* Header / Toolbar (Global App Controls) */}
      <div className={`fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 transition-opacity duration-500 ${isZenMode || isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <h1 className="text-xl font-bold text-slate-500 tracking-widest uppercase hidden sm:block">
          Chrono<span className="text-slate-300">Minimal</span>
        </h1>
        
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-800 shadow-2xl ml-auto">
          <button 
            onClick={() => setIsZenMode(!isZenMode)}
            className={`p-2 rounded-full transition-colors ${isZenMode ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            title="Zen Mode (Hide Controls)"
          >
            {isZenMode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="App Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1"></div>

          <button 
            onClick={addTimer}
            className="p-2 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            title="Add Stopwatch"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Grid - Vertical Stack */}
      <div 
        className={`min-h-screen flex flex-col items-center p-4 transition-all duration-500 gap-8 ${timers.length >= 1 ? 'pt-24 pb-24' : 'justify-center'}`}
      >
        {timers.map((timer) => (
          <Stopwatch 
            key={timer.id} 
            id={timer.id}
            totalTimers={timers.length}
            label={timer.label}
            isRunning={timer.isRunning}
            elapsedTime={timer.elapsedTime}
            onDelete={removeTimer} 
            onUpdateLabel={updateLabel}
            isZenMode={isZenMode}
            onToggle={handleToggle}
            onReset={handleReset}
            // DND Props
            handleDragStart={handleDragStart}
            handleDragDrop={handleDragDrop}
            handleDragOver={handleDragOver}
            isBeingDragged={draggedId === timer.id}
          />
        ))}
        
        {/* Add Button at Bottom of List */}
        <button 
          onClick={addTimer}
          className="group flex flex-col items-center gap-2 text-slate-600 hover:text-indigo-400 transition-colors py-4"
        >
          <div className="p-3 rounded-full border border-slate-800 group-hover:border-indigo-500/50 bg-slate-900/30">
            <Plus size={24} />
          </div>
          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Add New Timer</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className={`fixed bottom-4 left-0 right-0 text-center text-slate-800 text-sm pointer-events-none transition-opacity duration-500 ${isZenMode ? 'opacity-0' : 'opacity-100'}`}>
        Click time to start/stop • Drag handle to reorder • User ID: {userId}
      </div>
    </div>
  );
};

export default App;
