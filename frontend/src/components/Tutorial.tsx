import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, MessageCircle, Info } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface TutorialStep {
  text: string;
}

interface TutorialProps {
  pageId: string;
  steps: TutorialStep[];
  language: string;
  user: any;
  setUser: (user: any) => void;
}

const Mascot = ({ size = 80, onClick }: { size?: number, onClick?: () => void }) => (
  <motion.div 
    onClick={onClick}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Refined Horns (More stylized like the logo) */}
      <path 
        d="M32 30 C20 25 15 15 28 5 C25 15 28 25 40 32" 
        fill="var(--primary-red-hover)" 
        stroke="var(--primary-red-hover)" 
        strokeWidth="1" 
        strokeLinejoin="round" 
      />
      <path 
        d="M68 30 C80 25 85 15 72 5 C75 15 72 25 60 32" 
        fill="var(--primary-red-hover)" 
        stroke="var(--primary-red-hover)" 
        strokeWidth="1" 
        strokeLinejoin="round" 
      />
      
      {/* Body */}
      <motion.circle 
        cx="50" cy="65" r="30" 
        fill="var(--primary-red)" 
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Head */}
      <motion.circle 
        cx="50" cy="40" r="22" 
        fill="var(--primary-red)"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      {/* Eyes */}
      <circle cx="42" cy="35" r="4" fill="white" />
      <circle cx="58" cy="35" r="4" fill="white" />
      <motion.circle 
        cx="42" cy="35" r="2" fill="black"
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 1] }}
      />
      <motion.circle 
        cx="58" cy="35" r="2" fill="black"
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 1] }}
      />
      {/* Nose/Muzzle */}
      <ellipse cx="50" cy="48" rx="10" ry="7" fill="rgba(255,255,255,0.2)" />
      <circle cx="46" cy="48" r="1.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="54" cy="48" r="1.5" fill="rgba(255,255,255,0.5)" />
    </svg>
  </motion.div>
);

export default function Tutorial({ pageId, steps, language, user, setUser }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [inputText, setAmount] = useState(''); // reused state name or something? no, let's use inputText
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const seenTutorials = user.seen_tutorials?.split(',').filter(Boolean) || [];
    if (!seenTutorials.includes(pageId)) {
      const timer = setTimeout(() => setIsTutorialVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [pageId, user?.seen_tutorials]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const handleCloseTutorial = async () => {
    setIsTutorialVisible(false);
    
    // Update backend
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/tutorial/seen`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ pageId })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...user, seen_tutorials: data.seen_tutorials };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error('Error marking tutorial as seen', e);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCloseTutorial();
    }
  };

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || userInput;
    if (!textToSend.trim() || isTyping) return;

    const newMsg = { role: 'user' as const, text: textToSend };
    setChatMessages(prev => [...prev, newMsg]);
    if (!msgText) setUserInput('');
    setIsBotTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'bot', text: data.response }]);
        setIsBotTyping(false);
      }, 1000);
    } catch (e) {
      setIsBotTyping(false);
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Lo siento, he tenido un problema de conexión. ¿Puedes repetir?' }]);
    }
  };

  const suggestions = [
    { label: '¿Qué son los Toros?', value: 'toros' },
    { label: '¿Cómo subo de nivel?', value: 'nivel' },
    { label: '¿Qué es el cooldown?', value: 'cooldown' },
    { label: 'Ranking Global', value: 'ranking' },
    { label: '¿Vidas infinitas?', value: 'vidas' }
  ];

  return (
    <>
      <AnimatePresence>
        {/* Tutorial Cloud */}
        {isTutorialVisible && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', pointerEvents: 'auto' }} 
              onClick={handleCloseTutorial}
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'absolute',
                bottom: '120px',
                right: '40px',
                maxWidth: '350px',
                width: '90%',
                zIndex: 10000
              }}
            >
              <div style={{
                background: 'var(--card-bg)',
                padding: '25px',
                borderRadius: '24px',
                border: '3px solid var(--primary-red)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                position: 'relative',
                color: 'var(--text-color)'
              }}>
                <button 
                  onClick={handleCloseTutorial}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--secondary-text)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <Sparkles size={18} color="var(--primary-red)" />
                  <span style={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary-red)' }}>
                    {language === 'en' ? 'Guide' : 'Consejo del Toro'}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5', fontWeight: '700' }}>
                  {steps[currentStep].text}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--secondary-text)', fontWeight: 'bold' }}>
                    {currentStep + 1} / {steps.length}
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={handleCloseTutorial}
                      style={{ background: 'none', border: 'none', color: 'var(--secondary-text)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {language === 'en' ? 'Skip' : 'Saltar'}
                    </button>
                    <button 
                      onClick={handleNextStep}
                      className="btn-primary"
                      style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '12px' }}
                    >
                      {currentStep === steps.length - 1 ? (language === 'en' ? 'Got it!' : '¡Vamos!') : (language === 'en' ? 'Next' : 'Siguiente')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chat Icon (Mascot) */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9998, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              style={{
                width: '320px',
                height: '520px',
                background: 'var(--card-bg)',
                borderRadius: '24px',
                border: '2px solid var(--border-color)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                marginBottom: '10px'
              }}
            >
              <div style={{ padding: '15px 20px', background: 'var(--primary-red)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Info size={18} />
                  <span style={{ fontWeight: '800' }}>Asistente Investia</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ flexGrow: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--gray-bg)', padding: '12px 15px', borderRadius: '18px 18px 18px 0', fontSize: '14px', maxWidth: '85%', color: 'var(--text-color)', fontWeight: '700', border: '1px solid var(--border-color)' }}>
                  ¡Hola! Soy tu guía. Aquí tienes algunas dudas comunes:
                </div>
                
                {/* FAQ Suggestions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '5px' }}>
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05, background: 'var(--accent-light)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendMessage(s.value)}
                      style={{ 
                        background: 'var(--card-bg)', 
                        border: '2px solid var(--primary-red)', 
                        color: 'var(--primary-red)', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '800', 
                        cursor: 'pointer' 
                      }}
                    >
                      {s.label}
                    </motion.button>
                  ))}
                </div>

                <div style={{ borderBottom: '1px solid var(--border-color)', margin: '5px 0' }} />

                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.role === 'user' ? 'var(--primary-red)' : 'var(--gray-bg)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-color)',
                      padding: '12px 15px',
                      borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                      fontSize: '14px',
                      maxWidth: '85%',
                      fontWeight: '600',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div style={{ background: 'var(--gray-bg)', padding: '10px 15px', borderRadius: '15px 15px 15px 0', fontSize: '12px', width: 'fit-content' }}>
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}>Escribiendo...</motion.span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ padding: '15px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', background: 'var(--card-bg)' }}>
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escribe tu duda..."
                  style={{ flexGrow: 1, border: '2px solid var(--border-color)', borderRadius: '15px', padding: '10px 15px', outline: 'none', fontSize: '14px', background: 'var(--input-bg)', color: 'var(--text-color)', fontWeight: '600' }}
                />
                <button type="submit" style={{ background: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: '15px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(229, 57, 53, 0.3)' }}>
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Mascot size={isChatOpen ? 60 : 100} onClick={() => setIsChatOpen(!isChatOpen)} />
      </div>
    </>
  );
}
