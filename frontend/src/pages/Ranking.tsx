import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, TrendingUp, User as UserIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Tutorial from '../components/Tutorial';

export default function Ranking({ user, setUser, language }: { user: any, setUser: any, language: string }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/courses/leaderboard`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank || 0);
        setLoading(false);
      })
      .catch(() => {
        setLeaderboard([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-color)' }}>{language === 'en' ? 'Loading ranking...' : 'Cargando ranking...'}</div>;

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <div className="container" style={{ marginTop: '40px', paddingBottom: '100px' }}>
      <Tutorial 
        pageId="ranking"
        language={language}
        user={user}
        setUser={setUser}
        steps={[
          { text: language === 'en' ? 'Behold the Global Ranking! See how you stack up against other investors.' : '¡Contempla el Ranking Global! Mira cómo te comparas con otros inversores.' },
          { text: language === 'en' ? 'Earn XP by completing questions and courses to climb the leaderboard.' : 'Gana XP completando preguntas y cursos para subir en la tabla de clasificación.' },
          { text: language === 'en' ? 'The top 3 investors get special medals. Can you reach the number one spot?' : 'Los 3 mejores inversores reciben medallas especiales. ¿Podrás llegar al puesto número uno?' }
        ]}
      />
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ 
            background: 'linear-gradient(135deg, var(--star-yellow) 0%, var(--primary-yellow-hover) 100%)', 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px',
            boxShadow: '0 10px 20px rgba(255, 215, 0, 0.3)'
          }}
        >
          <Trophy size={40} color="white" />
        </motion.div>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-color)', marginBottom: '10px' }}>
          {language === 'en' ? 'Global Ranking' : 'Ranking Global'}
        </h1>
        <p style={{ color: 'var(--secondary-text)', fontSize: '18px' }}>
          {language === 'en' ? 'Compete with other investors and reach the top.' : 'Compite con otros inversores y llega a lo más alto.'}
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* User Stats Card */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'var(--primary-red)', 
              borderRadius: '24px', 
              padding: '30px', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '40px',
              boxShadow: '0 20px 40px rgba(229, 57, 53, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '48px', fontWeight: '900', opacity: 0.5 }}>#{userRank || '?'}</div>
              <div>
                <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                  {language === 'en' ? 'Your Rank' : 'Tu Puesto'}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800' }}>{currentUser.name}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '900' }}>{currentUser.xp || 0} XP</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {language === 'en' ? 'Level' : 'Nivel'} {currentUser.level || 1}
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <div style={{ background: 'var(--card-bg)', borderRadius: '30px', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{ 
                padding: '20px 30px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px', 
                borderBottom: index === leaderboard.length - 1 ? 'none' : '1px solid var(--border-color)',
                background: index < 3 ? 'rgba(255, 215, 0, 0.05)' : 'transparent'
              }}
            >
              <div style={{ 
                width: '40px', 
                fontSize: '20px', 
                fontWeight: '900', 
                color: index === 0 ? 'var(--star-yellow)' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--secondary-text)' 
              }}>
                {index + 1}
              </div>
              
              <div style={{ position: 'relative' }}>
                {user.avatar_url ? (
                  <img src={`${API_BASE_URL}${user.avatar_url}`} alt={user.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-text)' }}>
                    <UserIcon size={24} />
                  </div>
                )}
                {index < 3 && (
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    <Award size={16} color={index === 0 ? 'var(--star-yellow)' : index === 1 ? '#C0C0C0' : '#CD7F32'} fill={index === 0 ? 'var(--star-yellow)' : index === 1 ? '#C0C0C0' : '#CD7F32'} />
                  </div>
                )}
              </div>

              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: '800', color: 'var(--text-color)', fontSize: '18px' }}>{user.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '600' }}>Nivel {user.level}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--primary-red)', fontWeight: '900', fontSize: '18px' }}>{user.xp} XP</div>
                <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{user.points} pts</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
