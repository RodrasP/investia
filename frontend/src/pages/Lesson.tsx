import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Volume2, Check, X, GripVertical, ArrowRight, Heart, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import BullCoin from '../components/BullCoin';
import { API_BASE_URL } from '../config';

const AnsweredModal = ({ onClose }: { onClose: () => void }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(10px)' }}>
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ backgroundColor: 'var(--card-bg)', padding: '40px', borderRadius: '30px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
      <motion.div initial={{ rotate: -10, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} style={{ fontSize: '70px', filter: 'drop-shadow(0 10px 20px rgba(88, 204, 2, 0.4))' }}>✅</motion.div>
      <h2 style={{ margin: 0, color: 'var(--primary-green)', fontSize: '28px', fontWeight: '900' }}>¡Ya contestada!</h2>
      <p style={{ color: 'var(--secondary-text)', lineHeight: '1.6', fontSize: '16px' }}>Ya has completado esta pregunta correctamente en un intento anterior.</p>
      <button className="btn-primary" onClick={onClose} style={{ width: '100%', padding: '18px', borderRadius: '20px', fontSize: '16px' }}>ENTENDIDO</button>
    </motion.div>
  </div>
);

const CooldownModal = ({ onBack }: { onFinish?: () => void, onBack: () => void }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', backdropFilter: 'blur(15px)' }}>
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ backgroundColor: 'var(--card-bg)', padding: '50px 30px', borderRadius: '40px', maxWidth: '450px', width: '100%', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '25px', border: '3px solid var(--primary-red)' }}>
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: '80px' }}>⏳</motion.div>
      <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '32px', fontWeight: '900' }}>¡NIVEL BLOQUEADO!</h2>
      <p style={{ color: 'var(--secondary-text)', fontSize: '18px', lineHeight: '1.6' }}>Debes esperar <strong>5 horas</strong> entre cada estrella para asimilar los conocimientos. ¡Vuelve pronto para el siguiente nivel!</p>
      <button className="btn-primary" onClick={onBack} style={{ width: '100%', padding: '20px', borderRadius: '24px', fontSize: '18px', fontWeight: '900' }}>VOLVER AL CURSO</button>
    </motion.div>
  </div>
);

const CourseCompleteModal = ({ bonus, courseTitle, onFinish }: { bonus: number, courseTitle: string, onFinish: () => void }) => {
  const [displayPoints, setDisplayPoints] = useState(0);

  useEffect(() => {
    if (!bonus || bonus <= 0) {
      setDisplayPoints(0);
      return;
    }
    let current = 0;
    const duration = 1500;
    const interval = 20;
    const step = bonus / (duration / interval);
    
    const timer = setInterval(() => {
      current += step;
      if (current >= bonus) {
        setDisplayPoints(bonus);
        clearInterval(timer);
      } else {
        setDisplayPoints(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [bonus]);

  const celebrationEmojis = ['🎉', '✨', '💰', '🔥', '🚀', '🐂', '🪙'];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', backdropFilter: 'blur(15px)' }}>
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        style={{ backgroundColor: 'var(--card-bg)', padding: '50px 30px', borderRadius: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '25px', border: '3px solid var(--primary-red)' }}
      >
        <div style={{ position: 'relative', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ 
                scale: [0, 1, 0], 
                x: Math.cos(i * 30 * Math.PI / 180) * 150, 
                y: Math.sin(i * 30 * Math.PI / 180) * 150 
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              style={{ position: 'absolute', fontSize: '24px', pointerEvents: 'none' }}
            >
              {celebrationEmojis[i % celebrationEmojis.length]}
            </motion.div>
          ))}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ color: 'var(--star-yellow)' }}
          >
            <Trophy size={100} />
          </motion.div>
        </div>

        <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase' }}>¡CURSO COMPLETADO!</h2>
        <p style={{ color: 'var(--secondary-text)', fontSize: '18px', margin: 0 }}>Has dominado con éxito el curso:<br/><strong style={{ color: 'var(--primary-red)' }}>{courseTitle}</strong></p>
        
        <div style={{ background: 'rgba(229, 57, 53, 0.1)', padding: '20px', borderRadius: '24px', border: '2px solid rgba(229, 57, 53, 0.2)', margin: '10px 0' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recompensa de Bonus</div>
          <div style={{ fontSize: '56px', fontWeight: '950', color: 'var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <BullCoin size={40} />
            {displayPoints}
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={onFinish} 
          style={{ width: '100%', padding: '22px', borderRadius: '24px', fontSize: '20px', fontWeight: '900', boxShadow: '0 10px 0 var(--primary-red-dark)' }}
        >
          ¡ESTUPENDO!
        </button>
      </motion.div>
    </div>
  );
};

const MatchingExercise = ({ items, onReorder, question, feedback, isAlreadyCorrect }: { items: any[], onReorder: (items: any[]) => void, question: any, feedback: any, isAlreadyCorrect: boolean }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
         {question.answers.map((ans: any) => (
           <div key={ans.id} style={{ 
             background: 'var(--gray-bg)', 
             border: '2px solid var(--border-color)', 
             padding: '20px', 
             borderRadius: '20px', 
             minHeight: '80px', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center', 
             color: 'var(--text-color)', 
             fontWeight: '800', 
             fontSize: '16px', 
             textAlign: 'center'
           }}>
             {ans.text_en || ans.text}
           </div>
         ))}
      </div>
      
      <Reorder.Group axis="y" values={items} onReorder={onReorder} style={{ display: 'flex', flexDirection: 'column', gap: '15px', listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item) => (
          <Reorder.Item 
            key={item.id} 
            value={item}
            dragListener={!(feedback?.correct || isAlreadyCorrect)}
          >
            <motion.div 
              whileHover={{ scale: (feedback?.correct || isAlreadyCorrect) ? 1 : 1.02 }}
              style={{ 
                background: 'var(--card-bg)', 
                border: '2px solid var(--primary-red)', 
                padding: '20px', 
                borderRadius: '20px', 
                minHeight: '80px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: (feedback?.correct || isAlreadyCorrect) ? 'default' : 'grab',
                color: 'var(--text-color)',
                boxShadow: '0 8px 20px rgba(229, 57, 53, 0.15)',
                fontWeight: '800',
                fontSize: '16px'
              }}
            >
              <span style={{ flexGrow: 1, textAlign: 'center' }}>{item.text}</span>
              <GripVertical size={20} color="var(--primary-red)" />
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

const ConnectArrowsExercise = ({ question, pairs, setPairs, feedback, isAlreadyCorrect, rightItems }: { question: any, pairs: any, setPairs: (p: any) => void, feedback: any, isAlreadyCorrect: boolean, rightItems: any[] }) => {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  const handleLeftClick = (id: number) => {
    if (feedback?.correct || isAlreadyCorrect) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (rightItem: any) => {
    if (feedback?.correct || isAlreadyCorrect) return;
    
    // If clicking an already connected right item, find which left it belongs to and clear it
    const existingLeftId = Object.keys(pairs).find(k => pairs[parseInt(k)].id === rightItem.id);
    
    if (selectedLeft !== null) {
      // Connect selected left to this right
      setPairs({ ...pairs, [selectedLeft]: rightItem });
      setSelectedLeft(null);
    } else if (existingLeftId) {
      // Clear existing connection
      const newPairs = { ...pairs };
      delete newPairs[parseInt(existingLeftId)];
      setPairs(newPairs);
    }
  };

  if (!question?.answers || !rightItems || rightItems.length === 0) return null;

  const rowHeight = 90; // Fixed height for perfect alignment
  const gap = 20;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 120px 1fr', 
        gap: '0', 
        position: 'relative', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
          {question.answers.map((ans: any) => (
            <div 
              key={ans.id} 
              onClick={() => handleLeftClick(ans.id)}
              style={{ 
                height: `${rowHeight}px`,
                background: selectedLeft === ans.id ? 'var(--accent-light)' : 'var(--gray-bg)', 
                border: selectedLeft === ans.id ? '3px solid var(--primary-red)' : '2px solid var(--border-color)', 
                padding: '10px 20px', 
                borderRadius: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                fontWeight: '800',
                color: 'var(--text-color)',
                transition: 'all 0.2s',
                textAlign: 'center',
                position: 'relative',
                zIndex: 10
              }}
            >
              {ans.text_en || ans.text}
              <div style={{ 
                position: 'absolute', 
                right: '-10px', 
                width: '14px', 
                height: '14px', 
                background: 'var(--primary-red)', 
                borderRadius: '50%', 
                border: '3px solid var(--card-bg)',
                boxShadow: selectedLeft === ans.id ? '0 0 10px var(--primary-red)' : 'none'
              }} />
            </div>
          ))}
        </div>

        {/* Center Area for SVG Lines */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
            {Object.entries(pairs || {}).map(([leftId, rightItem]: [string, any]) => {
              const leftIdx = question.answers.findIndex((a: any) => a.id === parseInt(leftId));
              const rightIdx = rightItems.findIndex((a: any) => a.id === rightItem.id);
              if (leftIdx === -1 || rightIdx === -1) return null;
              
              const y1 = (leftIdx * (rowHeight + gap)) + (rowHeight / 2);
              const y2 = (rightIdx * (rowHeight + gap)) + (rowHeight / 2);

              return (
                <motion.line 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  key={`${leftId}-${rightItem.id}`}
                  x1="0%" y1={y1} 
                  x2="100%" y2={y2} 
                  stroke="var(--primary-red)" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
          {rightItems.map((ans: any) => {
            const isConnected = Object.values(pairs || {}).some((p: any) => p && p.id === ans.id);
            return (
              <div 
                key={ans.id} 
                onClick={() => handleRightClick(ans)}
                style={{ 
                  height: `${rowHeight}px`,
                  background: 'var(--card-bg)', 
                  border: isConnected ? '3px solid var(--primary-red)' : '2px solid var(--border-color)', 
                  padding: '10px 20px', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  fontWeight: '800',
                  color: 'var(--text-color)',
                  transition: 'all 0.2s',
                  boxShadow: isConnected ? '0 5px 15px rgba(229, 57, 53, 0.1)' : 'none',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  left: '-10px', 
                  width: '14px', 
                  height: '14px', 
                  background: 'var(--primary-red)', 
                  borderRadius: '50%', 
                  border: '3px solid var(--card-bg)' 
                }} />
                {ans.text}
              </div>
            );
          })}
        </div>
      </div>
      
      <button 
        className="btn-secondary" 
        onClick={() => setPairs({})} 
        disabled={Object.keys(pairs || {}).length === 0 || feedback?.correct || isAlreadyCorrect}
        style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}
      >
        Limpiar Selecciones
      </button>
    </div>
  );
};

const ImageTextExercise = ({ question, pairs, setPairs, feedback, isAlreadyCorrect, rightItems }: { question: any, pairs: any, setPairs: (p: any) => void, feedback: any, isAlreadyCorrect: boolean, rightItems: any[] }) => {
  const [selectedImg, setSelectedImg] = useState<number | null>(null);

  const handleImgClick = (id: number) => {
    if (feedback?.correct || isAlreadyCorrect) return;
    setSelectedImg(id);
  };

  const handleTextClick = (ans: any) => {
    if (selectedImg === null || feedback?.correct || isAlreadyCorrect) return;
    setPairs({ ...pairs, [selectedImg]: ans });
    setSelectedImg(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
        {question.answers.map((ans: any) => (
          <motion.div 
            key={ans.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleImgClick(ans.id)}
            style={{ 
              background: 'var(--card-bg)', 
              borderRadius: '24px', 
              padding: '15px', 
              border: selectedImg === ans.id ? '4px solid var(--primary-red)' : '2px solid var(--border-color)',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <img src={ans.image_url} alt="" style={{ width: '100%', height: '100px', objectFit: 'contain', marginBottom: '10px' }} />
            <div style={{ minHeight: '30px', background: 'var(--gray-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--primary-red)' }}>
              {pairs[ans.id]?.text || '?'}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
        {(rightItems || []).map((ans: any) => {
          const isUsed = Object.values(pairs || {}).some((p: any) => p?.id === ans.id);
          return (
            <button
              key={ans.id}
              onClick={() => handleTextClick(ans)}
              className="btn-secondary"
              disabled={isUsed || feedback?.correct || isAlreadyCorrect}
              style={{ 
                padding: '12px 25px', 
                borderRadius: '16px', 
                opacity: isUsed ? 0.3 : 1,
                border: '2px solid var(--primary-red)',
                color: 'var(--text-color)',
                fontWeight: 'bold'
              }}
            >
              {ans.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MatchConceptsExercise = ({ question, pairs, setPairs, feedback, isAlreadyCorrect, rightItems }: { question: any, pairs: any, setPairs: (p: any) => void, feedback: any, isAlreadyCorrect: boolean, rightItems: any[] }) => {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  const leftItems = question.answers;

  const handlePair = (leftId: number, rightItem: any) => {
    if (feedback?.correct || isAlreadyCorrect) return;
    setPairs({ ...pairs, [leftId]: rightItem });
    setSelectedLeft(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {leftItems.map((ans: any) => (
            <div 
              key={ans.id}
              onClick={() => setSelectedLeft(ans.id)}
              style={{ 
                padding: '20px', 
                background: selectedLeft === ans.id ? 'var(--accent-light)' : 'var(--gray-bg)', 
                borderRadius: '20px', 
                border: selectedLeft === ans.id ? '3px solid var(--primary-red)' : '2px solid var(--border-color)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              {ans.text_en || ans.text}
              {pairs[ans.id] && <div style={{ marginTop: '10px', color: 'var(--primary-red)', fontSize: '14px' }}>→ {pairs[ans.id].text}</div>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {(rightItems || []).map((ans: any) => {
            const isUsed = Object.values(pairs || {}).some((p: any) => p?.id === ans.id);
            return (
              <button
                key={ans.id}
                onClick={() => selectedLeft && handlePair(selectedLeft, ans)}
                disabled={isUsed || !selectedLeft || feedback?.correct || isAlreadyCorrect}
                style={{ 
                  padding: '20px', 
                  background: 'var(--card-bg)', 
                  borderRadius: '20px', 
                  border: '2px solid var(--primary-red)',
                  cursor: (isUsed || !selectedLeft) ? 'default' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isUsed ? 0.3 : (selectedLeft ? 1 : 0.5),
                  boxShadow: 'var(--shadow-sm)',
                  color: 'var(--text-color)'
                }}
              >
                {ans.text}
              </button>
            );
          })}
        </div>
      </div>
      <button 
        className="btn-secondary" 
        onClick={() => setPairs({})} 
        style={{ alignSelf: 'center' }}
        disabled={Object.keys(pairs || {}).length === 0 || feedback?.correct || isAlreadyCorrect}
      >
        Limpiar Selecciones
      </button>
    </div>
  );
};

const RewardsAnimation = ({ xp, points }: { xp: number, points: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, scale: 0.5 }}
    animate={{ opacity: 1, y: -100, scale: 1.2 }}
    exit={{ opacity: 0, scale: 1.5 }}
    style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      zIndex: 1000, 
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center'
    }}
  >
    {xp > 0 && (
      <div style={{ background: 'var(--primary-green)', color: 'white', padding: '10px 25px', borderRadius: '30px', fontWeight: '900', fontSize: '24px', boxShadow: '0 10px 20px rgba(88, 204, 2, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        +{xp} XP
      </div>
    )}
    {points > 0 && (
      <div style={{ background: 'var(--primary-red)', color: 'white', padding: '10px 25px', borderRadius: '30px', fontWeight: '900', fontSize: '24px', boxShadow: '0 10px 20px rgba(229, 57, 53, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BullCoin size={24} /> +{points}
      </div>
    )}
  </motion.div>
);

export default function Lesson({ user, setUser, language, getT, t, isCrazyMode }: { user: any, setUser: any, language: string, getT: any, t: any, isCrazyMode?: boolean }) {
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [step, setStep] = useState('content'); // 'content' or 'quiz'
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [matchingItems, setMatchingItems] = useState<any[]>([]);
  const [rightItems, setRightItems] = useState<any[]>([]);
  const [pairs, setPairs] = useState<any>({});
  const [feedback, setFeedback] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showAnsweredModal, setShowAnsweredModal] = useState(false);
  const [courseCompletionInfo, setCourseCompletionInfo] = useState<{ isCompleted: boolean, bonus: number, title: string } | null>(null);
  const [error, setError] = useState(false);
  const [showRewards, setShowRewards] = useState<{xp: number, points: number} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/courses/lessons/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setLesson(data);
      })
      .catch(() => setError(true));
  }, [id]);

  useEffect(() => {
    if (lesson && lesson.questions && lesson.questions[currentQuestionIdx]) {
      const q = lesson.questions[currentQuestionIdx];
      
      // Reset interaction states for new question
      setPairs({});
      setAnswerText('');
      setSelectedAnswer(null);
      setRightItems([]);

      if (['drag_drop', 'matching', 'matching_columns'].includes(q.type)) {
        const items = [...(q.answers || [])].sort(() => Math.random() - 0.5);
        setMatchingItems(items);
      }

      if (['connect_arrows', 'match_concepts', 'image_text_association'].includes(q.type)) {
        const items = [...(q.answers || [])].sort(() => Math.random() - 0.5);
        setRightItems(items);
      }
      
      // Auto-set feedback if already correct
      if (q.isAlreadyCorrect) {
        setFeedback({ correct: true, message: 'Ya has completado este ejercicio anteriormente.' });
      } else {
        setFeedback(null);
      }
    }
  }, [lesson, currentQuestionIdx]);

  const handleCheck = async () => {
    const question = lesson.questions[currentQuestionIdx];
    
    if (question.isAlreadyCorrect) {
      handleNext();
      return;
    }

    const body: any = { answerId: selectedAnswer };
    if (question.type === 'fill_in_blanks') {
      body.answerText = answerText;
    } else if (['connect_arrows', 'match_concepts', 'image_text_association'].includes(question.type)) {
      const matchingAnswers: any = {};
      Object.entries(pairs).forEach(([ansId, targetItem]: [string, any]) => {
        matchingAnswers[ansId] = targetItem.text;
      });
      body.matchingAnswers = matchingAnswers;
    } else if (['drag_drop', 'matching', 'matching_columns'].includes(question.type)) {
      const matchingAnswers: any = {};
      matchingItems.forEach((item, idx) => {
        matchingAnswers[item.id] = question.answers[idx].text;
      });
      body.matchingAnswers = matchingAnswers;
    }

    const res = await fetch(`${API_BASE_URL}/api/courses/questions/${question.id}/check`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (res.ok) {
      setFeedback(data);
      if (data.correct) {
        const updatedUser = { 
          ...user, 
          points: (user.points || 0) + (data.pointsAwarded || 0) + (data.courseBonus || 0),
          xp: (user.xp || 0) + (data.xpAwarded || 0),
          level: data.newLevel || user.level || 1
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Show rewards animation
        setShowRewards({ xp: data.xpAwarded || 0, points: data.pointsAwarded || 0 });
        setTimeout(() => setShowRewards(null), 2000);

        if (data.courseCompleted) {
          setCourseCompletionInfo({ isCompleted: true, bonus: data.courseBonus || 0, title: lesson.course_title || 'el curso' });
        }
      } else {
        const updatedUser = { ...user, lives: data.livesRemaining };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (data.livesRemaining === 0) {
           toast.error('¡Te has quedado sin vidas!');
           navigate('/');
        }
      }
    } else {
      if (res.status === 403 && data.alreadyAnswered) {
        setShowAnsweredModal(true);
      } else {
        toast.error(data.message || 'Error al comprobar respuesta');
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < lesson.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedAnswer(null);
      setAnswerText('');
      setFeedback(null);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await fetch(`${API_BASE_URL}/api/courses/lessons/${id}/complete`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({ level: lesson.stars })
    });
    navigate(-1); // Go back to the course view
  };

  if (error) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Error al cargar la lección. <button onClick={() => navigate(-1)} className="btn-secondary">Volver</button></div>;
  if (!lesson) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>{t[language]?.cargando || 'Cargando...'}</div>;

  const currentQuestion = lesson.questions?.[currentQuestionIdx];
  if (!currentQuestion) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Error: No se encontró la pregunta. <button onClick={() => navigate(-1)} className="btn-secondary">Volver</button></div>;

  // --- CONTENT STEP (Theory / Video / Reading) ---
  if (step === 'content') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background-color)', display: 'flex', flexDirection: 'column' }}>
        {/* Modern Nav for Lesson Content */}
        <div style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--gray-bg)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-color)' }}>
            <X size={20} />
          </button>
          <div style={{ fontWeight: 'bold', color: 'var(--secondary-text)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>
            TEORÍA
          </div>
          <div style={{ width: '40px' }} /> {/* spacer */}
        </div>

        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ color: 'var(--text-color)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', margin: 0, lineHeight: '1.2' }}>
              {getT(lesson, "title")}
            </motion.h1>
            
            {lesson.video_url && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', background: '#000' }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <video controls style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} src={lesson.video_url && lesson.video_url.startsWith('/uploads') ? `${API_BASE_URL}${lesson.video_url}` : (lesson.video_url || '')}></video>
                </div>
              </motion.div>
            )}

            {lesson.audio_url && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--card-bg)', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                 <div style={{ background: 'rgba(229, 57, 53, 0.1)', padding: '15px', borderRadius: '50%' }}>
                   <Volume2 size={32} color="var(--primary-red)" />
                 </div>
                 <audio controls style={{ flexGrow: 1, height: '40px' }}>
                   <source src={lesson.audio_url && lesson.audio_url.startsWith('/uploads') ? `${API_BASE_URL}${lesson.audio_url}` : (lesson.audio_url || '')} type="audio/mpeg" />
                 </audio>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: '18px', color: 'var(--text-color)', lineHeight: '1.8', whiteSpace: 'pre-wrap', background: 'var(--card-bg)', padding: '40px', borderRadius: '30px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              {getT(lesson, "content")}
            </motion.div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  if (lesson.questions?.length > 0) setStep('quiz');
                  else handleComplete();
                }} 
                style={{ 
                  background: 'var(--primary-red)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '18px 40px', 
                  borderRadius: '20px', 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  boxShadow: '0 8px 20px rgba(229, 57, 53, 0.3)',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {lesson.questions?.length > 0 ? (t[language].continuar_al_quiz || 'Ir a los Ejercicios') : (t[language].finalizar_leccion || 'Finalizar')}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- QUIZ STEP ---
  
  const renderExercise = () => {
    switch (currentQuestion.type) {
      case 'fill_in_blanks':
        const rawText = getT(currentQuestion, "text") || "";
        // If there are no underscores, add one at the end as fallback
        const hasUnderscore = rawText.includes('_');
        const textToSplit = hasUnderscore ? rawText : rawText + " _";
        // Normalize multiple underscores to one and split
        const parts = textToSplit.replace(/_+/g, '_').split('_');
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '5px', 
              fontSize: 'clamp(20px, 4vw, 32px)', 
              color: 'var(--text-color)', 
              lineHeight: '1.6', 
              background: 'var(--card-bg)', 
              padding: '60px 30px', 
              borderRadius: '32px', 
              border: '2px solid var(--border-color)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              textAlign: 'center',
              width: '100%',
              maxWidth: '850px',
              margin: '0 auto'
            }}>
              {parts.map((part: string, i: number) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'pre-wrap' }}>
                  {part}
                  {i < parts.length - 1 && (
                    <div style={{
                      borderBottom: '4px solid var(--border-color)',
                      minWidth: '120px',
                      padding: '0 10px',
                      margin: '0 10px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-red)',
                      fontWeight: '900',
                      transition: 'all 0.2s'
                    }}>
                      {answerText}
                    </div>
                  )}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
              {(currentQuestion.answers || []).map((ans: any) => (
                <button
                  key={ans.id}
                  onClick={() => setAnswerText(ans.text)}
                  className="btn-secondary"
                  disabled={feedback?.correct || currentQuestion.isAlreadyCorrect}
                  style={{ 
                    padding: '12px 25px', 
                    borderRadius: '16px', 
                    border: '2px solid',
                    borderColor: answerText === ans.text ? 'var(--primary-red)' : 'var(--border-color)',
                    background: answerText === ans.text ? 'rgba(229, 57, 53, 0.1)' : 'var(--card-bg)',
                    color: 'var(--text-color)',
                    fontWeight: 'bold',
                    boxShadow: 'var(--shadow-sm)',
                    opacity: feedback?.correct || currentQuestion.isAlreadyCorrect ? 0.7 : 1
                  }}
                >
                  {ans.text}
                </button>
              ))}
            </div>
          </div>
        );

      case 'drag_drop':
      case 'matching':
      case 'matching_columns':
        return (
          <MatchingExercise 
            items={matchingItems} 
            onReorder={setMatchingItems} 
            question={currentQuestion} 
            feedback={feedback} 
            isAlreadyCorrect={currentQuestion.isAlreadyCorrect} 
          />
        );

      case 'connect_arrows':
        return (
          <ConnectArrowsExercise
            key={currentQuestion.id}
            question={currentQuestion}
            pairs={pairs}
            setPairs={setPairs}
            feedback={feedback}
            isAlreadyCorrect={currentQuestion.isAlreadyCorrect}
            rightItems={rightItems}
          />
        );

      case 'match_concepts':
        return (
          <MatchConceptsExercise
            question={currentQuestion}
            pairs={pairs}
            setPairs={setPairs}
            feedback={feedback}
            isAlreadyCorrect={currentQuestion.isAlreadyCorrect}
            rightItems={rightItems}
          />
        );

      case 'image_text_association':
        return (
          <ImageTextExercise
            question={currentQuestion}
            pairs={pairs}
            setPairs={setPairs}
            feedback={feedback}
            isAlreadyCorrect={currentQuestion.isAlreadyCorrect}
            rightItems={rightItems}
          />
        );

      case 'true_false':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { id: 1, text: 'Verdadero', val: true, color: 'var(--primary-green)' },
              { id: 0, text: 'Falso', val: false, color: '#FF4B4B' }
            ].map((opt) => {
              const ans = currentQuestion.answers.find((a: any) => (a.text.toLowerCase() === 'verdadero' && opt.val) || (a.text.toLowerCase() === 'falso' && !opt.val));
              const isSelected = selectedAnswer === ans?.id;
              return (
                <motion.button 
                  key={opt.text}
                  whileHover={(!feedback?.correct && !currentQuestion.isAlreadyCorrect) ? { scale: 1.02, y: -5 } : {}}
                  whileTap={(!feedback?.correct && !currentQuestion.isAlreadyCorrect) ? { scale: 0.98 } : {}}
                  onClick={() => setSelectedAnswer(ans?.id)}
                  disabled={feedback?.correct || currentQuestion.isAlreadyCorrect}
                  style={{ 
                    height: '150px', 
                    fontSize: '28px',
                    fontWeight: '900',
                    borderRadius: '24px',
                    border: '3px solid',
                    background: isSelected ? `${opt.color}15` : 'var(--card-bg)',
                    borderColor: isSelected ? opt.color : 'var(--border-color)',
                    color: isSelected ? opt.color : 'var(--text-color)',
                    cursor: (feedback?.correct || currentQuestion.isAlreadyCorrect) ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 10px 25px ${opt.color}30` : 'var(--shadow-sm)'
                  }}
                >
                  {opt.text}
                </motion.button>
              );
            })}
          </div>
        );

      default: // multiple_choice
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {currentQuestion.answers.map((answer: any, idx: number) => {
              const isSelected = selectedAnswer === answer.id;
              return (
                <motion.button 
                  key={answer.id} 
                  whileHover={(!feedback?.correct && !currentQuestion.isAlreadyCorrect) ? { scale: 1.01, x: 5 } : {}}
                  whileTap={(!feedback?.correct && !currentQuestion.isAlreadyCorrect) ? { scale: 0.99 } : {}}
                  onClick={() => setSelectedAnswer(answer.id)}
                  disabled={feedback?.correct || currentQuestion.isAlreadyCorrect}
                  style={{ 
                    textAlign: 'left', 
                    padding: '25px 30px',
                    borderRadius: '20px',
                    fontSize: '18px',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    border: '2px solid',
                    borderColor: isSelected ? 'var(--primary-red)' : 'var(--border-color)',
                    background: isSelected ? 'rgba(229, 57, 53, 0.05)' : 'var(--card-bg)',
                    color: isSelected ? 'var(--primary-red)' : 'var(--text-color)',
                    cursor: (feedback?.correct || currentQuestion.isAlreadyCorrect) ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                  }}
                >
                  <div style={{ 
                    width: '30px', height: '30px', 
                    borderRadius: '8px', 
                    background: isSelected ? 'var(--primary-red)' : 'var(--gray-bg)', 
                    color: isSelected ? 'white' : 'var(--secondary-text)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '14px'
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  {getT(answer, "text")}
                </motion.button>
              );
            })}
          </div>
        );
    }
  };

  const progressPercentage = ((currentQuestionIdx) / lesson.questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background-color)', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      {showAnsweredModal && <AnsweredModal onClose={() => setShowAnsweredModal(false)} />}
      {lesson?.cooldownActive && <CooldownModal onBack={() => navigate(-1)} />}
      
      {/* CRAZY MODE ANIMATIONS */}
      <AnimatePresence>
        {isCrazyMode && feedback?.correct && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 2000, overflow: 'hidden' }}>
            {['🚀', '💎', '🌕', '📈', '💰', '🐂', '🔥', '🚀', '🙌', '💵'].map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: '100vh', 
                  x: `${Math.random() * 100}vw`, 
                  rotate: 0,
                  scale: 0 
                }}
                animate={{ 
                  y: '-20vh', 
                  x: `${Math.random() * 100}vw`,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  scale: [1, 2, 1.5]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  ease: "easeOut",
                  delay: Math.random() * 0.5
                }}
                style={{ position: 'absolute', fontSize: '40px' }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRewards && (
          <RewardsAnimation xp={showRewards.xp} points={showRewards.points} />
        )}
      </AnimatePresence>

      {courseCompletionInfo && (
        <CourseCompleteModal 
          bonus={courseCompletionInfo.bonus} 
          courseTitle={courseCompletionInfo.title} 
          onFinish={() => {
            setCourseCompletionInfo(null);
            handleNext();
          }} 
        />
      )}
      
      {/* Quiz Navbar */}
      <div style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '30px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)' }}>
          <X size={28} />
        </button>
        <div style={{ flexGrow: 1, height: '12px', background: 'var(--gray-bg)', borderRadius: '6px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progressPercentage}%` }} 
            style={{ height: '100%', background: 'var(--primary-green)', borderRadius: '6px' }} 
            transition={{ type: 'spring' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF4B4B', fontWeight: '900', fontSize: '20px' }}>
          <Heart size={24} fill="#FF4B4B" /> {user.lives}
        </div>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ width: '100%', marginTop: '40px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', color: 'var(--text-color)', marginBottom: '40px', fontWeight: '900', lineHeight: '1.3' }}>
            {currentQuestion.type === 'fill_in_blanks' ? 'Completa la frase:' : getT(currentQuestion, "text")}
          </h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {renderExercise()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '2px solid var(--border-color)', background: feedback ? (feedback.correct ? 'rgba(88, 204, 2, 0.1)' : 'rgba(255, 75, 75, 0.1)') : 'var(--card-bg)', transition: 'background 0.3s', zIndex: 100 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {feedback && (
              <>
                <div style={{ background: feedback.correct ? 'var(--primary-green)' : 'var(--error-red)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  {feedback.correct ? <Check size={32} /> : <X size={32} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', color: feedback.correct ? 'var(--primary-green-dark)' : 'var(--primary-red-dark)', fontWeight: '900' }}>
                    {feedback.correct ? '¡Excelente!' : 'Respuesta incorrecta'}
                  </h3>
                  <p style={{ margin: '5px 0 0 0', color: feedback.correct ? 'var(--primary-green)' : 'var(--error-red)', fontWeight: 'bold' }}>
                    {feedback.message}
                  </p>
                </div>
              </>
            )}
          </div>

          <button 
            className="btn-primary"
            style={{ 
              padding: '16px 40px', 
              fontSize: '18px', 
              borderRadius: '16px',
              minWidth: '200px',
              background: feedback ? (feedback.correct ? 'var(--primary-green)' : 'var(--error-red)') : 'var(--primary-red)',
              boxShadow: feedback ? `0 4px 0 ${feedback.correct ? 'var(--primary-green-dark)' : 'var(--primary-red-dark)'}` : '0 4px 0 var(--primary-red-dark)',
              opacity: (() => {
                if (feedback) return 1;
                if (currentQuestion.type === 'fill_in_blanks') return answerText ? 1 : 0.5;
                if (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') return selectedAnswer ? 1 : 0.5;
                if (['connect_arrows', 'match_concepts', 'image_text_association'].includes(currentQuestion.type)) return Object.keys(pairs).length === currentQuestion.answers.length ? 1 : 0.5;
                return 1;
              })()
            }}
            onClick={feedback ? ((feedback.correct || currentQuestion.isAlreadyCorrect) ? handleNext : () => { setFeedback(null); setSelectedAnswer(null); setAnswerText(''); setPairs({}); }) : handleCheck}
            disabled={(() => {
              if (feedback) return false;
              if (currentQuestion.type === 'fill_in_blanks') return !answerText;
              if (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') return !selectedAnswer;
              if (['connect_arrows', 'match_concepts', 'image_text_association'].includes(currentQuestion.type)) return Object.keys(pairs).length !== currentQuestion.answers.length;
              return false;
            })()}
          >
            {feedback ? (feedback.correct ? 'CONTINUAR' : 'REINTENTAR') : 'COMPROBAR'}
          </button>

        </div>
      </div>
    </div>
  );
}
