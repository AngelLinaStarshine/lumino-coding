/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Send, Code2, MonitorPlay, X, MessageCircle, Sun, Moon, Sparkles, Image as ImageIcon, Key, Trophy, Target, Star, ChevronRight, Lock, Check } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

import { LEVELS, getLevelById, type Level } from './levels';

type Tab = 'html' | 'css' | 'js';
type Theme = 'light' | 'dark';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
}

interface QuestState {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  icon: React.ReactNode;
}

export default function App() {
  const [currentLevelId, setCurrentLevelId] = useState(LEVELS[0].id);
  const [unlockedLevels, setUnlockedLevels] = useState<Set<string>>(new Set([LEVELS[0].id]));
  const [completedQuestsByLevel, setCompletedQuestsByLevel] = useState<Record<string, Set<string>>>({});
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [levelToComplete, setLevelToComplete] = useState<Level | null>(null);

  const currentLevel = getLevelById(currentLevelId) ?? LEVELS[0];

  const [html, setHtml] = useState(currentLevel.html);
  const [css, setCss] = useState(currentLevel.css);
  const [js, setJs] = useState(currentLevel.js);
  const [activeTab, setActiveTab] = useState<Tab>('html');
  const [output, setOutput] = useState('');
  const [isFlameOpen, setIsFlameOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I’m Flame Bot 🔥 Ask me about HTML/CSS/JS for this task.", sender: 'bot' },
    { id: 2, text: "Tip: Use querySelectorAll('.balloon') to get all balloons.", sender: 'bot' },
    { id: 3, text: "Tip: Use CSS transition + transform: translateY() for smooth movement.", sender: 'bot' },
    { id: 5, text: "Tip: Store movement in dataset like balloon.dataset.lift.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [userName, setUserName] = useState<string>('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(true);
  const [isAssetLabOpen, setIsAssetLabOpen] = useState(false);
  const [assetPrompt, setAssetPrompt] = useState('');
  const [generatedAsset, setGeneratedAsset] = useState<string | null>(null);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Gamification State
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const quests: QuestState[] = currentLevel.quests.map(q => ({
    ...q,
    completed: completedQuestsByLevel[currentLevelId]?.has(q.id) ?? false,
  }));
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [completedQuest, setCompletedQuest] = useState<QuestState | null>(null);
  const [showPasteWarning, setShowPasteWarning] = useState(false);

  // XP to Level Logic
  useEffect(() => {
    const newLevel = Math.floor(xp / 500) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [xp, level]);

  const completeQuest = (id: string) => {
    const q = currentLevel.quests.find(x => x.id === id);
    if (!q || completedQuestsByLevel[currentLevelId]?.has(id)) return;
    setCompletedQuestsByLevel(prev => {
      const next = { ...prev };
      const set = new Set(next[currentLevelId] ?? []);
      set.add(id);
      next[currentLevelId] = set;
      return next;
    });
    setXp(curr => curr + q.xp);
    setCompletedQuest({ ...q, completed: true });
    setTimeout(() => setCompletedQuest(null), 4000);
    const completed = new Set(completedQuestsByLevel[currentLevelId] ?? []);
    completed.add(id);
    const requiredQuests = currentLevel.quests.filter(x => x.id !== 'asset');
    const allDone = requiredQuests.length > 0 && requiredQuests.every(x => completed.has(x.id) || x.id === id);
    if (allDone) {
      setLevelToComplete(currentLevel);
      setShowLevelComplete(true);
      const nextIdx = LEVELS.findIndex(l => l.id === currentLevelId) + 1;
      if (nextIdx < LEVELS.length) {
        setUnlockedLevels(prev => new Set([...prev, LEVELS[nextIdx].id]));
      }
    }
  };

  useEffect(() => {
    const lvl = getLevelById(currentLevelId) ?? LEVELS[0];
    setHtml(lvl.html);
    setCss(lvl.css);
    setJs(lvl.js);
    setMessages(lvl.starterMessages.map((m, i) => ({ id: i + 1, text: m.text, sender: m.sender })));
    setOutput(buildSrcDoc(lvl.html, lvl.css, lvl.js, theme));
  }, [currentLevelId, theme]);

  // Check for API key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSrcDoc = (h: string, c: string, j: string, currentTheme: Theme) => {
    const themeStyles = currentTheme === 'dark' 
      ? `
        :root {
          --bg: #0f172a;
          --card: #1e293b;
          --text: #f8fafc;
        }
        body { background-color: #0f172a !important; color: #f8fafc !important; }
        .app { background-color: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; color: #f8fafc !important; }
        .bar { border-bottom-color: rgba(255,255,255,0.1) !important; }
        .stage { background: linear-gradient(#1e293b, #0f172a 70%) !important; }
        .ground { background: linear-gradient(#0f172a, #1e293b) !important; border-top-color: rgba(255,255,255,0.05) !important; }
        .note { color: rgba(255,255,255,0.6) !important; }
        button { background: #f8fafc !important; color: #0f172a !important; }
        .string { background: rgba(255,255,255,0.3) !important; }
      ` 
      : '';

    return h
      .replace(/<link[^>]*href=["']styles\.css["'][^>]*>/i, `<style>${c}${themeStyles}</style>`)
      .replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/i, `<script>${j}</script>`);
  };

  const handleRun = () => {
    setOutput(buildSrcDoc(html, css, js, theme));
    completeQuest('run');
    currentLevel.quests.forEach(q => {
      if (q.check(html, css, js)) completeQuest(q.id);
    });
  };

  useEffect(() => {
    handleRun();
  }, [theme]);

  const handleReset = () => {
    if (window.confirm("Reset code to this level's starter?")) {
      setHtml(currentLevel.html);
      setCss(currentLevel.css);
      setJs(currentLevel.js);
      setOutput(buildSrcDoc(currentLevel.html, currentLevel.css, currentLevel.js, theme));
    }
  };

  const flameHint = (userMsg: string) => {
    const msg = userMsg.toLowerCase();
    if (msg.includes("move") || msg.includes("up")) {
      return "Hint: In JS, loop through balloons and set style.transform = `translateY(-liftPx)` after increasing lift.";
    }
    if (msg.includes("transition") || msg.includes("smooth")) {
      return "Hint: In CSS, add: transition: transform 350ms ease; to the .balloon class.";
    }
    if (msg.includes("five") || msg.includes("5")) {
      return "Hint: Create 5 divs with class 'balloon' and different colors/left positions. Then select them with querySelectorAll('.balloon').";
    }
    if (msg.includes("wrap") || msg.includes("top")) {
      return "Hint: Calculate a max height. If lift > max, reset lift to 0 (wrap back to bottom).";
    }
    if (msg.includes("dataset") || msg.includes("data")) {
      return "Hint: Use balloon.dataset.lift to store how far each balloon has moved. Convert using Number() and String().";
    }
    return "Try asking: 'How do I select all balloons?', 'How do I make it smooth?', or 'How do I wrap at the top?'";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{
              text: `You are a Socratic tutor for a Grade 10 student working on: "${currentLevel.title}" (${currentLevel.difficulty} level).
              
              CONTEXT:
              - HTML: ${html}
              - CSS: ${css}
              - JS: ${js}
              
              STUDENT QUESTION: ${currentInput}
              
              RULES:
              1. DO NOT give the answer or the code directly.
              2. Guide the student through the reasoning process.
              3. Identify knowledge gaps (e.g., if they don't understand loops or event listeners).
              4. Provide step-by-step explanations tailored to their level.
              5. Be encouraging and helpful, but firm about them doing the work.
              6. Keep responses concise and focused on the next logical step.`
            }]
          }
        ]
      });

      const botResponse = response.text || "I'm having a bit of trouble thinking right now. Try asking in a different way!";
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error("Tutor Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Oops! I lost my connection to the classroom. Can you try again?", sender: 'bot' }]);
    }
  };

  const handleGenerateAsset = async () => {
    if (!hasApiKey) {
      handleOpenKeyDialog();
      return;
    }

    setIsGeneratingAsset(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A high-quality, colorful, 2D game asset of ${assetPrompt}. Isolated on a simple background, suitable for a web coding project.`,
        config: { numberOfImages: 1 },
      });

      const generatedImages = response.generatedImages;
      if (generatedImages?.[0]?.image?.imageBytes) {
        setGeneratedAsset(`data:image/png;base64,${generatedImages[0].image.imageBytes}`);
        completeQuest('asset');
      }
    } catch (error: any) {
      console.error("Asset Generation Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        alert("Please select a valid paid API key to use the image generator.");
      }
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  // Run initial code on mount
  useEffect(() => {
    handleRun();
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#f0f2f5] text-slate-900'} font-sans p-4 md:p-6 lg:p-8 relative overflow-x-hidden`}>
      
      {/* Level Up Notification */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-yellow-400 text-slate-900 px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-4 border-white"
          >
            <Trophy className="text-slate-900" size={32} />
            <div>
              <h4 className="font-black text-xl uppercase tracking-tighter">Level Up!</h4>
              <p className="text-sm font-bold opacity-80">You reached Level {level}!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Complete Modal */}
      <AnimatePresence>
        {showLevelComplete && levelToComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-md rounded-3xl p-10 text-center ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white'} shadow-2xl`}
            >
              <div className="text-6xl mb-4">{levelToComplete.emoji}</div>
              <h3 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Level Complete!</h3>
              <p className="text-slate-500 font-bold mb-6">{levelToComplete.title} mastered.</p>
              {LEVELS.findIndex(l => l.id === levelToComplete.id) < LEVELS.length - 1 ? (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      const next = LEVELS[LEVELS.findIndex(l => l.id === levelToComplete.id) + 1];
                      setCurrentLevelId(next.id);
                      setShowLevelComplete(false);
                      setLevelToComplete(null);
                    }}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                  >
                    Next Level <ChevronRight size={20} className="inline" />
                  </button>
                  <button
                    onClick={() => { setShowLevelComplete(false); setLevelToComplete(null); }}
                    className={`px-6 py-3 rounded-xl font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Stay
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowLevelComplete(false); setLevelToComplete(null); }}
                  className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600"
                >
                  Amazing! 🎉
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Completed Notification */}
      <AnimatePresence>
        {completedQuest && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed bottom-24 right-8 z-[200] bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-md"
          >
            <div className="bg-white/20 p-2 rounded-xl">
              <Star size={24} />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest">Quest Completed!</h4>
              <p className="text-sm font-bold">{completedQuest.title}</p>
              <p className="text-[10px] font-black text-green-100 mt-1">+{completedQuest.xp} XP EARNED</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Name Modal */}
      <AnimatePresence>
        {isNameModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
            >
              <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-orange-500/20 rotate-6">
                <Code2 className="text-white" size={40} />
              </div>
              <h2 className={`text-3xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Welcome to LuminoLearn</h2>
              <p className="text-slate-500 font-bold mb-8">Ready to start your coding adventure?</p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl border-2 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-center font-bold text-lg ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <button
                  onClick={() => userName.trim() && setIsNameModalOpen(false)}
                  disabled={!userName.trim()}
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20"
                >
                  Start Learning
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="max-w-[1600px] mx-auto mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
              <Code2 className="text-white" size={32} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-1 rounded-md shadow-sm border-2 border-white">
              LVL {level}
            </div>
          </div>
          <div>
            <h1 className={`text-4xl font-black tracking-tighter flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              LUMINO<span className="text-orange-500">LEARN</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student:</span>
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{userName || 'Explorer'}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1 h-2 w-48 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(xp % 500) / 5}%` }}
                  className="h-full bg-orange-500"
                />
              </div>
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest">{xp} XP</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mr-4">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-xs font-black uppercase tracking-widest">{quests.filter(q => q.completed).length}/{quests.length} Quests</span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAssetLabOpen(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all text-sm font-black uppercase tracking-wider ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-orange-400 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-orange-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles size={18} /> Asset Lab
          </motion.button>

          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`p-2.5 rounded-xl border-2 transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all text-sm font-black uppercase tracking-wider ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <RotateCcw size={18} /> Reset
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: ["0 10px 15px -3px rgba(249, 115, 22, 0.2)", "0 10px 25px -3px rgba(249, 115, 22, 0.4)", "0 10px 15px -3px rgba(249, 115, 22, 0.2)"]
            }}
            transition={{ 
              boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
            onClick={handleRun}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-lg font-black uppercase tracking-wider"
          >
            <Play size={18} fill="currentColor" /> Run Code
          </motion.button>
        </div>
      </header>

      <main className={`max-w-[1600px] mx-auto grid grid-cols-1 ${isMaximized ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-8 h-[calc(100vh-220px)] min-h-[650px] transition-all duration-500`}>
        
        {/* Sidebar: Level Selector + Quest Log (Hidden if maximized) */}
        {!isMaximized && (
          <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
            {/* Level Selector */}
            <div className={`rounded-3xl border-2 p-4 transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Levels</h2>
              <div className="flex flex-col gap-2">
                {LEVELS.map((lvl, idx) => {
                  const unlocked = unlockedLevels.has(lvl.id);
                  const isActive = currentLevelId === lvl.id;
                  const completed = (completedQuestsByLevel[lvl.id]?.size ?? 0) >= lvl.quests.filter(q => q.id !== 'asset').length;
                  return (
                    <motion.button
                      key={lvl.id}
                      whileHover={unlocked ? { scale: 1.02 } : {}}
                      whileTap={unlocked ? { scale: 0.98 } : {}}
                      onClick={() => unlocked && setCurrentLevelId(lvl.id)}
                      disabled={!unlocked}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isActive 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                          : unlocked 
                            ? theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                            : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-xl">{lvl.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{lvl.title}</div>
                        <div className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-orange-100' : 'text-slate-500'}`}>{lvl.difficulty}</div>
                      </div>
                      {!unlocked ? <Lock size={14} /> : completed ? <Check size={16} className="text-green-500" /> : null}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className={`flex-1 rounded-3xl border-2 p-6 flex flex-col overflow-hidden transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mb-6">
                <Target size={20} className="text-orange-500" />
                <h2 className="text-sm font-black uppercase tracking-widest">Quest Log</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {quests.map((quest) => (
                  <motion.div
                    key={quest.id}
                    initial={false}
                    animate={{ opacity: quest.completed ? 0.6 : 1 }}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      quest.completed 
                        ? (theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100')
                        : (theme === 'dark' ? 'bg-slate-800 border-orange-500/30' : 'bg-white border-orange-100')
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${quest.completed ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
                        {quest.completed ? <Star size={16} /> : quest.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xs font-black uppercase tracking-tight ${quest.completed ? 'line-through opacity-50' : ''}`}>{quest.title}</h3>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{quest.description}</p>
                      </div>
                      <div className="text-[10px] font-black text-orange-500">+{quest.xp}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className={`mt-6 pt-6 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Streak</span>
                  <span className="text-[10px] font-black text-orange-500">3 DAYS</span>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5,6,7].map(d => (
                    <div key={d} className={`h-1.5 flex-1 rounded-full ${d <= 3 ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEFT WINDOW: Editor */}
        <div className={`flex flex-col gap-6 h-full overflow-hidden ${isMaximized ? 'w-full' : 'lg:col-span-5'}`}>
          <div className={`flex-1 rounded-3xl border-2 transition-all flex flex-col overflow-hidden ${
            theme === 'dark'
              ? `bg-slate-900 ${isMaximized ? 'border-orange-500 shadow-orange-500/10' : 'border-slate-800 shadow-xl shadow-black/20'}`
              : `bg-white ${isMaximized ? 'border-orange-400 shadow-2xl' : 'border-slate-200 shadow-sm'}`
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b transition-colors ${
              theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/80'
            }`}>
              <div className="flex gap-2">
                {(['html', 'css', 'js'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                      activeTab === tab 
                        ? (theme === 'dark' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20')
                        : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100')
                    }`}
                  >
                    {tab === 'js' ? 'script.js' : tab === 'css' ? 'styles.css' : 'index.html'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 transition-colors ${
                    theme === 'dark' ? 'border-slate-800 text-slate-500 hover:border-orange-500 hover:text-orange-500' : 'border-slate-100 text-slate-400 hover:border-orange-500 hover:text-orange-500'
                  }`}
                >
                  {isMaximized ? 'Minimize' : 'Full Screen'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <textarea
                value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
                onPaste={(e) => {
                  e.preventDefault();
                  setShowPasteWarning(true);
                  setTimeout(() => setShowPasteWarning(false), 3000);
                }}
                onChange={(e) => {
                  if (activeTab === 'html') setHtml(e.target.value);
                  else if (activeTab === 'css') {
                    setCss(e.target.value);
                    if (e.target.value !== currentLevel.css) completeQuest('color');
                  }
                  else setJs(e.target.value);
                }}
                className={`w-full h-full p-8 font-mono text-sm focus:outline-none resize-none leading-relaxed transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-950 text-slate-300 selection:bg-orange-500/30' 
                    : 'bg-white text-slate-700 selection:bg-orange-100'
                }`}
                placeholder={`Enter your ${activeTab.toUpperCase()} code here...`}
                spellCheck={false}
              />
              
              <AnimatePresence>
                {showPasteWarning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 z-10 border-2 border-white/20 backdrop-blur-md"
                  >
                    <X size={16} className="bg-white/20 rounded-full p-0.5" />
                    Copy-pasting is disabled. Type your code!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT WINDOW: Live Output */}
        {!isMaximized && (
          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
            <div className={`flex-1 rounded-3xl border-2 transition-all flex flex-col overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-xl shadow-black/20' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
                theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div className="flex items-center gap-2">
                  <MonitorPlay size={16} className="text-orange-500" />
                  <span className="text-xs font-black uppercase tracking-widest">Live Preview</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>
              
              <div className={`flex-1 transition-colors ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                <iframe
                  title="Preview"
                  srcDoc={output}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                />
              </div>
            </div>

            {/* Hint Card */}
            <div className={`rounded-3xl border-2 p-6 transition-colors ${
              theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
                  <Star size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">Pro Tip</h3>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    {currentLevel.proTip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Asset Lab Modal */}
      <AnimatePresence>
        {isAssetLabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>AI Asset Lab</h2>
                    <p className="text-sm text-slate-500">Create custom graphics for your project</p>
                  </div>
                </div>
                <button onClick={() => setIsAssetLabOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {!hasApiKey ? (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center">
                    <Key className="mx-auto mb-4 text-orange-500" size={48} />
                    <h3 className="font-bold text-orange-900 mb-2">API Key Required</h3>
                    <p className="text-sm text-orange-800 mb-6">
                      To generate high-quality images, you need to select a paid Gemini API key. 
                      <br />
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline font-bold">Learn about billing</a>
                    </p>
                    <button
                      onClick={handleOpenKeyDialog}
                      className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                    >
                      Select API Key
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        What should I create?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={assetPrompt}
                          onChange={(e) => setAssetPrompt(e.target.value)}
                          placeholder="e.g., a shiny red hot air balloon"
                          className={`flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
                            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                        <button
                          onClick={handleGenerateAsset}
                          disabled={isGeneratingAsset || !assetPrompt.trim()}
                          className="px-6 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                          {isGeneratingAsset ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ImageIcon size={20} />}
                          Generate
                        </button>
                      </div>
                    </div>

                    {generatedAsset && (
                      <div className="space-y-4">
                        <div className={`aspect-square rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center ${theme === 'dark' ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                          <img src={generatedAsset} alt="Generated Asset" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                          <p className="text-xs font-mono break-all text-slate-500">
                            <strong>Tip:</strong> You can use this image URL in your HTML!
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flame Bot Floating Action Button */}
      <button
        onClick={() => setIsFlameOpen(!isFlameOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        {isFlameOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Flame Bot Chat Panel */}
      <AnimatePresence>
        {isFlameOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-80 h-[450px] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Flame Bot Assistant</span>
              </div>
              <button onClick={() => setIsFlameOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-900">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-orange-500 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-slate-800/50 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Flame Bot for a hint..."
                className="flex-1 bg-slate-800 border-none rounded-lg px-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-orange-500 outline-none"
              />
              <button 
                type="submit"
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

