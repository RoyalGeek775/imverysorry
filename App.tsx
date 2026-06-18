import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
// @ts-ignore
import heartImage from "./my_own_heart.png";
// @ts-ignore
import songUrl from "./song.mp3";

interface Memory {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_GREETING = "Hey love,";

const DEFAULT_LETTER_PARAGRAPHS = [
  "I'm sorryy.",
  "Not because I want everything to magically be okayy again.",
  "But because I genuinely understand that I hurt someonee I care about.",
  "You arent demanding.",
  "You deserve effortt.",
  "And you deserve someonee who learns from their mistakes.",
  "I'm trying to be that personn.",
  "Whether you forgive me todayy, tomorrow, or much laterr.",
  "I just wanted you to know thatt."
];

const DEFAULT_MEMORIES: Memory[] = [
  {
    id: "mem-1",
    title: "The first time we talked",
    content: "I remember howw nervous i was, but your voicee instantly put me at ease. I felt like I could be myself around you, and that was a rare feeling for me. I knew right then that you were special."
  },
  {
    id: "mem-2",
    title: "Our favorite animee",
    content: "Horimiya, Hori and Miyamura fight too, but they get back up and keep going. They support each other. I want to support you too, you arent demanding, you deserve effort. I want to be that person for youu."
  },
  {
    id: "mem-3",
    title: "That random late night conversation",
    content: "I really lovee themm. We laid our guardss down completelyy. I felt saferr in those quiet hours than I had in a long, long time."
  },
  {
    id: "mem-4",
    title: "I cant stop smiling because of you",
    content: "I smileee everytimee thinking about you. I blush so hardd. You makee me feel like the luckiest person in the worldd. I hope I makee you feel the same wayy."
  }
];

const DEFAULT_SIGNATURE = "abhinav";

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [expandedMemories, setExpandedMemories] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const newAudio = new Audio(songUrl);
    newAudio.loop = true;
    newAudio.volume = 0.45;
    setAudio(newAudio);
    return () => {
      newAudio.pause();
    };
  }, []);

  useEffect(() => {
    if (!audio) return;
    const playOnInteraction = () => {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
      window.removeEventListener("scroll", playOnInteraction);
      window.removeEventListener("click", playOnInteraction);
    };
    window.addEventListener("scroll", playOnInteraction, { passive: true });
    window.addEventListener("click", playOnInteraction, { passive: true });
    return () => {
      window.removeEventListener("scroll", playOnInteraction);
      window.removeEventListener("click", playOnInteraction);
    };
  }, [audio]);

  const togglePlayback = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const getVirtualScrollY = (pY: number) => {
    const keyframes = [
      { p: 0, v: 0 },
      { p: 1000, v: 400 },
      { p: 2400, v: 1200 },
      { p: 4000, v: 2500 },
      { p: 5500, v: 3600 },
      { p: 6500, v: 6600 },
      { p: 8200, v: 7500 },
      { p: 9800, v: 8900 },
      { p: 11500, v: 10400 }
    ];

    if (pY <= keyframes[0].p) return keyframes[0].v;
    if (pY >= keyframes[keyframes.length - 1].p) return keyframes[keyframes.length - 1].v;

    for (let i = 0; i < keyframes.length - 1; i++) {
      const k1 = keyframes[i];
      const k2 = keyframes[i + 1];
      if (pY >= k1.p && pY <= k2.p) {
        const pct = (pY - k1.p) / (k2.p - k1.p);
        return k1.v + pct * (k2.v - k1.v);
      }
    }
    return pY;
  };

  const virtualScrollY = getVirtualScrollY(scrollY);

  const startBgTransition = 2300;
  const endBgTransition = 4200;

  let ratio = 0;
  if (virtualScrollY <= startBgTransition) {
    ratio = 0;
  } else if (virtualScrollY >= endBgTransition) {
    ratio = 1;
  } else {
    ratio = (virtualScrollY - startBgTransition) / (endBgTransition - startBgTransition);
  }

  const lerp = (startVal: number, endVal: number, pct: number) => {
    return Math.round(startVal + (endVal - startVal) * pct);
  };

  const bgR = lerp(17, 250, ratio);
  const bgG = lerp(17, 246, ratio);
  const bgB = lerp(17, 240, ratio);
  const currentBgColor = `rgb(${bgR}, ${bgG}, ${bgB})`;

  const textR = lerp(230, 28, ratio);
  const textG = lerp(226, 26, ratio);
  const textB = lerp(218, 23, ratio);
  const currentTextColor = `rgb(${textR}, ${textG}, ${textB})`;

  const lR = lerp(45, 210, ratio);
  const lG = lerp(45, 195, ratio);
  const lB = lerp(45, 185, ratio);
  const currentLineColor = `rgb(${lR}, ${lG}, ${lB})`;

  const getFadeStyle = (elementVirtualY: number, activeRange = 350) => {
    const dist = virtualScrollY - elementVirtualY;

    let opacity = 0;
    if (Math.abs(dist) < activeRange) {
      const norm = Math.abs(dist) / activeRange;
      opacity = Math.cos(norm * Math.PI / 2);
    }

    const translateY = -dist * 0.28;

    return {
      opacity,
      transform: `translate3d(0, ${translateY}px, 0)`,
      pointerEvents: opacity > 0.1 ? ("auto" as const) : ("none" as const),
      visibility: opacity > 0.01 ? ("visible" as const) : ("hidden" as const),
    };
  };

  useEffect(() => {
    document.body.style.backgroundColor = currentBgColor;
  }, [currentBgColor]);

  const toggleMemory = (id: string) => {
    setExpandedMemories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div
      style={{ color: currentTextColor }}
      className="font-sans selection:bg-neutral-200 selection:text-neutral-900 transition-colors duration-500 w-full relative"
    >
      <div className="fixed top-6 right-6 z-50 pointer-events-auto">
        <button
          onClick={togglePlayback}
          style={{ fontFamily: 'var(--font-handwritten), cursive', borderColor: currentTextColor }}
          className="px-4 py-2 bg-transparent border-2 rounded-full text-lg cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 select-none"
        >
          <span className="relative flex h-2 w-2">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-red-500' : 'bg-neutral-400'}`}></span>
          </span>
          <span>{isPlaying ? "music on" : "music off"}</span>
        </button>
      </div>

      <div className="h-[12000px] w-full pointer-events-none select-none absolute top-0 left-0" />

      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden pointer-events-none z-10">
        
        <div 
          style={getFadeStyle(180, 240)} 
          className="absolute max-w-xl text-center px-6"
        >
          <h1 className="font-serif text-3xl md:text-5xl tracking-wide leading-relaxed font-light text-[#FAF6F0]">
            I know you're hurt.
          </h1>
          <p 
            style={{ fontFamily: 'var(--font-handwritten), cursive' }}
            className="text-2xl text-[#8C867A] mt-8 font-light tracking-wide animate-pulse"
          >
            Scroll gently to breathe
          </p>
        </div>

        <div 
          style={getFadeStyle(600, 210)} 
          className="absolute max-w-xl text-center px-6"
        >
          <h2 className="font-serif text-2xl md:text-4xl tracking-wide leading-relaxed font-light italic text-[#FAF0E6]">
            And honestly...
          </h2>
        </div>

        <div 
          style={getFadeStyle(1000, 210)} 
          className="absolute max-w-xl text-center px-6"
        >
          <h2 className="font-serif text-2xl md:text-4xl tracking-wide leading-relaxed font-light text-[#FAF0E6]">
            You have every right to be.
          </h2>
        </div>

        <div 
          style={getFadeStyle(1450, 260)} 
          className="absolute max-w-2xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl tracking-wide leading-relaxed font-light">
            I spent a lot of time thinking about what happened.
          </p>
        </div>

        <div 
          style={getFadeStyle(1850, 260)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl tracking-wide leading-relaxed font-light italic">
            Not about defending myself.
          </p>
        </div>

        <div 
          style={getFadeStyle(2250, 260)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl tracking-wide leading-relaxed font-light">
            But about understanding how it made you feel.
          </p>
        </div>

        <div 
          style={getFadeStyle(2650, 220)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl tracking-wide leading-relaxed font-light text-red-500/80 dark:text-red-400">
            I should have listened more.
          </p>
        </div>

        <div 
          style={getFadeStyle(2950, 220)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl tracking-wide leading-relaxed font-light">
            I should have been more patient.
          </p>
        </div>

        <div 
          style={getFadeStyle(3250, 220)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl tracking-wide leading-relaxed font-light">
            I should have been more understanding.
          </p>
        </div>

        <div 
          style={getFadeStyle(3550, 220)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl tracking-wide font-medium italic">
            I should have done better.
          </p>
        </div>

        <div 
          style={getFadeStyle(5000, 1300)} 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <div 
            style={{ borderColor: currentLineColor }}
            className="h-72 w-[1px] border-l border-dashed opacity-30 select-none" 
          />
        </div>

        <div 
          style={getFadeStyle(4600, 280)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl italic tracking-wide leading-relaxed font-light opacity-80">
            This silence...
          </p>
        </div>

        <div 
          style={getFadeStyle(5650, 280)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl tracking-wide leading-relaxed font-light opacity-80">
            ...felt longer than it should have.
          </p>
        </div>

        <div 
          style={getFadeStyle(7050, 520)} 
          className="absolute w-full max-w-2xl px-6 pointer-events-auto"
        >
          <div className="w-full bg-[#FCFAF7] border border-[#ECDCCB] shadow-sm rounded-lg p-8 md:p-14 text-neutral-800 flex flex-col relative">
            <div className="absolute top-0 bottom-0 left-8 w-[1px] bg-red-200/50 pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-8 pl-4 select-none">
              <span className="font-mono text-[9px] text-neutral-400 font-light tracking-wider uppercase">
                Thoughts in Ink
              </span>
              <span className="font-mono text-[9px] text-neutral-400 font-light flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-neutral-300 rounded-full inline-block"></span>
                A quiet message
              </span>
            </div>

            <div className="pl-4 mb-6">
              <h3 className="text-xl md:text-2xl font-serif text-neutral-900 font-semibold">
                {DEFAULT_GREETING}
              </h3>
            </div>

            <div className="pl-4 space-y-6 md:space-y-7 font-serif text-base md:text-[17px] leading-relaxed text-neutral-700">
              {DEFAULT_LETTER_PARAGRAPHS.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="pl-4 mt-12 pt-6 border-t border-neutral-100 flex flex-col items-start gap-1 select-none">
              <span className="text-[10px] uppercase tracking-wider font-mono text-neutral-400 font-light">With absolute honesty,</span>
              <h4 className="text-lg font-serif italic text-neutral-900 mt-1 font-medium">
                {DEFAULT_SIGNATURE}
              </h4>
            </div>
          </div>
        </div>

        <div 
          style={getFadeStyle(8400, 680)} 
          className="absolute w-full max-w-xl px-6 pointer-events-auto"
        >
          <div className="text-center mb-10 select-none relative">
            <div 
              style={{ fontFamily: 'var(--font-handwritten), cursive' }}
              className="absolute -top-12 -left-16 text-2xl text-neutral-400 dark:text-neutral-500 rotate-[-6deg] hidden lg:block select-none pointer-events-none"
            >
              some of my favorite moments...
            </div>
            
            <h3 
              style={{ fontFamily: 'var(--font-handwritten), cursive' }}
              className="text-4xl md:text-5xl tracking-wide font-normal text-red-500/90 dark:text-red-400/90"
            >
              Our Memory Line
            </h3>
            
            <p className="text-xs font-serif text-neutral-500 italic mt-3">
              Click any node below to unlock the words kept inside.
            </p>

            <div 
              style={{ fontFamily: 'var(--font-handwritten), cursive' }}
              className="absolute -bottom-10 -right-16 text-2xl text-red-500/80 dark:text-red-400/80 rotate-[4deg] hidden lg:block select-none pointer-events-none"
            >
              i cherish these so much.
            </div>
          </div>

          <div className="relative flex flex-col items-center">
            <svg
              className="absolute left-6 md:left-1/2 top-4 bottom-4 w-12 -translate-x-1/2 overflow-visible pointer-events-none select-none"
              viewBox="0 0 20 500"
              preserveAspectRatio="none"
              style={{ stroke: currentLineColor }}
            >
              <path
                d="M 10 0 Q 18 100, 2 200 T 15 350 T 6 500"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="4 3"
                className="opacity-75 transition-colors duration-500"
              />
              <path
                d="M 9 2 Q 16 102, 3 198 T 13 349 T 7 500"
                fill="none"
                strokeWidth="0.8"
                strokeLinecap="round"
                className="opacity-40 transition-colors duration-500"
              />
            </svg>

            <div className="space-y-16 w-full relative z-10">
              {DEFAULT_MEMORIES.map((memory, index) => {
                const isEven = index % 2 === 0;
                const isExpanded = expandedMemories[memory.id] || false;

                return (
                  <div key={memory.id} className="w-full relative flex flex-col md:flex-row md:items-center">
                    
                    <div className="absolute left-[11px] md:left-1/2 top-2 -translate-x-1/2 z-20">
                      <button
                        onClick={() => toggleMemory(memory.id)}
                        style={{
                          backgroundColor: isExpanded ? currentTextColor : currentBgColor,
                          borderColor: currentTextColor
                        }}
                        className="w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full bg-current transition-transform duration-300 ${isExpanded ? 'scale-0' : 'scale-100'}`} />
                      </button>
                    </div>

                    <div className={`w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 flex ${isEven ? 'md:justify-end' : 'md:justify-start md:order-2 md:pl-12 md:pr-0'}`}>
                      <div className={`w-full max-w-[280px] text-left ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                        
                        <button
                          onClick={() => toggleMemory(memory.id)}
                          style={{ fontFamily: 'var(--font-handwritten), cursive' }}
                          className={`text-2xl md:text-3xl font-normal tracking-wide text-left cursor-pointer hover:opacity-100 ${isExpanded ? 'opacity-100 font-bold text-red-500 dark:text-red-400' : 'opacity-85'} transition-all duration-200 block w-full ${isEven ? 'md:text-right' : 'md:text-left'} flex items-center gap-1 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}
                        >
                          {index === 0 && (
                            <svg className="w-6 h-6 opacity-60 inline-block mr-1 select-none pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 3 C14 8, 8 10, 12 14 C15 17, 9 20, 12 22" strokeLinecap="round" />
                            </svg>
                          )}
                          
                          <span>{memory.title}</span>

                          {index === 1 && (
                            <span style={{ fontFamily: 'var(--font-handwritten), cursive' }} className="text-xl text-amber-500/80 mx-2 animate-pulse select-none font-bold">"secret"</span>
                          )}

                          {index === 2 && (
                            <svg className="w-5 h-5 opacity-60 inline-block ml-1 select-none pointer-events-none text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 2 L13 8 L19 9 L13 10 L12 16 L11 10 L5 9 L11 8 Z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}

                          {index === 3 && (
                            <svg className="w-5 h-5 opacity-70 inline-block ml-1 select-none pointer-events-none text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeLinecap="round" />
                            </svg>
                          )}
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              className="overflow-hidden mt-2"
                            >
                              <div className="bg-[#FAF0E6]/20 dark:bg-neutral-800/20 border border-[#ECDCCB]/40 dark:border-neutral-800 rounded p-4 text-sm font-serif italic text-current leading-relaxed shadow-inner">
                                {memory.content}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    </div>

                    <div className="hidden md:block md:w-1/2" />

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div 
          style={getFadeStyle(9250, 220)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl italic tracking-wide leading-relaxed font-light opacity-80">
            I can't change yesterday.
          </p>
        </div>

        <div 
          style={getFadeStyle(9550, 220)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-xl md:text-3xl tracking-wide leading-relaxed font-light opacity-90">
            But I can choose how I show up tomorrow.
          </p>
        </div>

        <div 
          style={getFadeStyle(9850, 220)} 
          className="absolute max-w-xl text-center px-6"
        >
          <p className="font-serif text-2xl md:text-4xl tracking-wide font-light">
            If you'll let me.
          </p>
        </div>

        <div 
          style={getFadeStyle(10250, 320)} 
          className="absolute flex flex-col items-center gap-5 text-center px-6"
        >
          <div className="relative flex items-center justify-center">
            <img
              src={heartImage}
              alt="Anatomical Heart"
              referrerPolicy="no-referrer"
              className="w-24 h-24 object-contain animate-real-heartbeat mix-blend-multiply dark:mix-blend-screen relative z-10 select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-red-400/20 rounded-full blur-2xl opacity-60 scale-150 animate-real-heartbeat pointer-events-none" />
          </div>
          
          <div className="flex flex-col items-center">
            <p className="font-mono text-[9px] tracking-widest uppercase opacity-40 leading-none select-none">
              Sincerely yours,
            </p>
            <h4 
              style={{ fontFamily: 'var(--font-signature), "Mrs Saint Delafield", cursive' }}
              className="text-5xl md:text-6xl text-red-600 dark:text-red-400/90 mt-1 pb-1 select-none flex items-center justify-center tracking-wider"
            >
              {Array.from(DEFAULT_SIGNATURE).map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, width: 0, x: -6, filter: "blur(3px)" }}
                  whileInView={{
                    opacity: 1,
                    width: "auto",
                    x: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: 0.45,
                      delay: index * 0.28,
                      ease: [0.25, 0.1, 0.25, 1.0]
                    }
                  }}
                  viewport={{ once: false, amount: 0.1 }}
                  className="inline-block origin-bottom-left whitespace-pre"
                >
                  {char}
                </motion.span>
              ))}
            </h4>
          </div>

          <div className="text-center mt-8 bg-neutral-500/5 hover:bg-neutral-500/10 pointer-events-auto rounded-full px-5 py-2 transition-colors duration-300">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-mono text-[9px] uppercase tracking-widest opacity-50 cursor-pointer"
            >
              Scroll up to read again
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
