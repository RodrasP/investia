import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShoppingBag, CreditCard, CheckCircle, Check, Sparkles, Gift, Info } from 'lucide-react';
import { API_BASE_URL } from '../config';
import BullCoin from '../components/BullCoin';
import { useNavigate } from 'react-router-dom';
import Tutorial from '../components/Tutorial';

export default function Shop({ user, setUser, language }: { user: any, setUser: any, language: string, t: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [revealedReward, setRevealedReward] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'items'>('items');
  const [mbSettings, setMbSettings] = useState<any>(null);
  const [showProbabilities, setShowProbabilities] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/shop/items`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/shop/mystery-box/settings`).then(res => res.json())
    ])
    .then(([itemsData, mbData]) => {
      setItems(itemsData);
      setMbSettings(mbData);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  const handleSubscribe = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/register');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ plan: 'premium' })
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || 'Error al iniciar suscripción');
      }
    } catch (err) {
      toast.error('Error en la conexión con el servidor');
    }
  };

  const handlePurchase = async (itemId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setPurchasing(itemId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/shop/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ itemId })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data);
        const updatedUser = { ...user };
        if (data.type === 'points') updatedUser.points = data.points;
        if (data.type === 'lives') updatedUser.lives = data.lives;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Error processing purchase');
    } finally {
      setPurchasing(null);
    }
  };

  const handleOpenMysteryBox = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!mbSettings) return;
    if (user.points < mbSettings.cost) {
      toast.error(`Necesitas al menos ${mbSettings.cost} TRS para abrir la caja`);
      return;
    }
    
    setIsOpeningBox(true);
    
    // Simulate opening with suspense
    setTimeout(async () => {
      const outcomes = [
        { type: 'points', amount: mbSettings.jackpot_amount, msg: `¡JACKPOT BRUTAL! +${mbSettings.jackpot_amount} TRS 🚀💎`, prob: mbSettings.jackpot_prob, icon: '🔥' },
        { type: 'points', amount: mbSettings.normal_amount, msg: `¡No está mal! +${mbSettings.normal_amount} TRS 🪙`, prob: mbSettings.normal_prob, icon: '💰' },
        { type: 'lives', amount: 1, msg: '¡Extra life! +1 Vida ❤️', prob: mbSettings.life_prob, icon: '❤️' },
        { type: 'rugpull', amount: 0, msg: 'RUG PULL: Te han desplumado... 📉', prob: mbSettings.nothing_prob, icon: '🤡' }
      ];
      
      const random = Math.random();
      let cumulative = 0;
      let selected: any = outcomes[outcomes.length - 1];
      
      for (const o of outcomes) {
        cumulative += o.prob;
        if (random <= cumulative) {
          selected = o;
          break;
        }
      }
      
      const newPoints = (user?.points || 0) - mbSettings.cost + (selected.type === 'points' ? selected.amount : 0);
      const newLives = (user?.lives || 0) + (selected.type === 'lives' ? selected.amount : 0);
      
      await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points: newPoints, lives: newLives })
      });

      const updatedUser = { ...user, points: newPoints, lives: newLives };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setRevealedReward(selected);
      setIsOpeningBox(false);
    }, 2500);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando tienda...</div>;

  return (
    <div className="container wide" style={{ padding: '40px 20px' }}>
      <Tutorial 
        pageId="shop"
        language={language}
        user={user}
        setUser={setUser}
        steps={[
          { text: language === 'en' ? 'Welcome to the Shop! Here you can upgrade your account and get more resources.' : '¡Bienvenido a la Tienda! Aquí puedes mejorar tu cuenta y conseguir más recursos.' },
          { text: language === 'en' ? 'Upgrade to Premium for unlimited lives and exclusive courses.' : 'Pásate a Premium para tener vidas ilimitadas y cursos exclusivos.' },
          { text: language === 'en' ? 'Feeling lucky? Try the Mystery Box to win bonus Toros or extra lives!' : '¿Te sientes con suerte? ¡Prueba la Caja Misteriosa para ganar Toros extra o vidas!' }
        ]}
      />
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary-red)', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '15px' }}
        >
          <ShoppingBag size={20} />
          <span>TIENDA INVESTIA</span>
        </motion.div>
        <h1 style={{ fontSize: '42px', marginBottom: '15px' }}>Potencia tu Aprendizaje</h1>
        <p style={{ color: 'var(--secondary-text)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Consigue los recursos que necesitas para avanzar más rápido en tus cursos.
        </p>
      </header>

      {/* TABS FILTER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginBottom: '50px',
        background: 'var(--gray-bg)',
        padding: '8px',
        borderRadius: '20px',
        width: 'fit-content',
        margin: '0 auto 50px'
      }}>
        <button 
          onClick={() => setActiveTab('plans')}
          style={{
            padding: '12px 30px',
            borderRadius: '15px',
            border: 'none',
            background: activeTab === 'plans' ? 'var(--card-bg)' : 'transparent',
            color: activeTab === 'plans' ? 'var(--primary-red)' : 'var(--secondary-text)',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: activeTab === 'plans' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CreditCard size={18} /> PLANES PREMIUM
        </button>
        <button 
          onClick={() => setActiveTab('items')}
          style={{
            padding: '12px 30px',
            borderRadius: '15px',
            border: 'none',
            background: activeTab === 'items' ? 'var(--card-bg)' : 'transparent',
            color: activeTab === 'items' ? 'var(--primary-red)' : 'var(--secondary-text)',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: activeTab === 'items' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={18} /> OFERTAS Y TRS
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'plans' ? (
          <motion.div
            key="plans-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {(!user || user.subscription_status !== 'premium') ? (
              <motion.section 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--accent-light) 100%)',
                  padding: '40px',
                  borderRadius: '40px',
                  border: '4px solid var(--primary-red)',
                  marginBottom: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(229, 57, 53, 0.1)'
                }}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                  <Sparkles size={200} color="var(--primary-red)" />
                </div>

                <div style={{ background: 'var(--primary-red)', color: 'white', padding: '10px 25px', borderRadius: '30px', fontWeight: '900', fontSize: '14px', marginBottom: '20px', zIndex: 1 }}>
                  OFERTA LIMITADA
                </div>
                
                <h2 style={{ fontSize: '36px', marginBottom: '15px', color: 'var(--text-color)' }}>Pásate a Investia Premium</h2>
                <p style={{ maxWidth: '600px', fontSize: '18px', color: 'var(--secondary-text)', marginBottom: '30px' }}>
                  Desbloquea todos los cursos, obtén vidas ilimitadas y descuentos exclusivos en la tienda por solo 19€/mes.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', width: '100%', maxWidth: '800px', marginBottom: '40px', textAlign: 'left' }}>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <FeatureItem text="Acceso a +50 cursos exclusivos" />
                    <FeatureItem text="Vidas infinitas (nunca pares)" />
                    <FeatureItem text="Certificados de finalización" />
                  </ul>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <FeatureItem text="-20% en compra de Toros (TRS)" />
                    <FeatureItem text="Soporte prioritario 24/7" />
                    <FeatureItem text="Sin anuncios (próximamente)" />
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                  onClick={handleSubscribe}
                  style={{ padding: '20px 60px', fontSize: '20px', borderRadius: '30px' }}
                >
                  MEJORAR MI CUENTA POR 19€
                </motion.button>
              </motion.section>
            ) : (
              <div style={{ 
                padding: '60px', 
                textAlign: 'center', 
                background: 'var(--gray-bg)', 
                borderRadius: '40px',
                border: '2px dashed var(--border-color)',
                marginBottom: '60px'
              }}>
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>👑</div>
                <h2 style={{ color: 'var(--text-color)' }}>¡Ya eres un inversor Premium!</h2>
                <p style={{ color: 'var(--secondary-text)' }}>Disfrutas de todas las ventajas, vidas infinitas y descuentos exclusivos.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="items-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* NEW: MYSTERY BOX SECTION */}
            <section style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Gift color="var(--primary-red)" /> Suerte del Día
              </h2>
              <div style={{ 
                background: 'var(--card-bg)', 
                padding: '30px', 
                borderRadius: '30px', 
                border: '3px dashed var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '30px'
              }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <motion.div 
                    animate={isOpeningBox ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: isOpeningBox ? Infinity : 0, duration: 0.5 }}
                    style={{ fontSize: '60px' }}
                  >
                    🎁
                  </motion.div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ margin: 0, fontSize: '22px' }}>Caja Sorpresa Diaria</h3>
                      <button 
                        onClick={() => setShowProbabilities(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--secondary-text)', cursor: 'pointer', display: 'flex' }}
                        title="Ver probabilidades"
                      >
                        <Info size={18} />
                      </button>
                    </div>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--secondary-text)' }}>Gana vidas, toros o... quédate como estás. ¡Solo {mbSettings?.cost || 20} TRS!</p>
                  </div>
                  </div>
                  <button 
                  className="btn-secondary" 
                  disabled={isOpeningBox}
                  onClick={handleOpenMysteryBox}
                  style={{ 
                    padding: '15px 40px', 
                    borderRadius: '20px', 
                    background: 'linear-gradient(45deg, var(--primary-yellow), var(--primary-yellow-hover))',
                    color: 'white',
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                  >
                  {isOpeningBox ? 'ABRIENDO...' : `ABRIR POR ${mbSettings?.cost || 20} TRS`}
                  </button>
                  </div>
                  </section>
            <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Objetos de la Tienda</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
              {items.map((item) => {
                const isPremium = user?.subscription_status === 'premium';
                const price = isPremium ? item.price_premium : item.price;
                const originalPrice = isPremium ? item.price : null;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -5 }}
                    style={{
                      background: 'var(--card-bg)',
                      borderRadius: '30px',
                      padding: '30px',
                      border: '2px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {isPremium && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--success-green)', color: 'white', padding: '4px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
                        DTO. PREMIUM
                      </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                      {item.type === 'points' ? (
                        <BullCoin size={80} />
                      ) : (
                        <div style={{ fontSize: '80px' }}>❤️</div>
                      )}
                    </div>

                    <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{language === 'es' ? item.label : item.label_en}</h3>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-color)', marginBottom: '5px' }}>
                      {item.amount} {item.type === 'points' ? 'TRS' : 'VIDAS'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                      {originalPrice && (
                        <span style={{ textDecoration: 'line-through', color: 'var(--secondary-text)', fontSize: '18px' }}>
                          {originalPrice}€
                        </span>
                      )}
                      <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary-red)' }}>
                        {price}€
                      </span>
                    </div>

                    <button
                      className="btn-primary"
                      onClick={() => handlePurchase(item.id)}
                      disabled={purchasing === item.id}
                      style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                      {purchasing === item.id ? 'PROCESANDO...' : 'COMPRAR AHORA'}
                      <CreditCard size={18} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProbabilities && mbSettings && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '24px', maxWidth: '400px', width: '100%', border: '2px solid var(--border-color)' }}
            >
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Info size={20} color="var(--primary-red)" /> Probabilidades Reales</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ProbRow label="Jackpot (Max TRS)" prob={mbSettings.jackpot_prob} icon="🔥" />
                <ProbRow label="TRS Normal" prob={mbSettings.normal_prob} icon="💰" />
                <ProbRow label="1 Vida Extra" prob={mbSettings.life_prob} icon="❤️" />
                <ProbRow label="Rug Pull (Nada)" prob={mbSettings.nothing_prob} icon="📉" />
              </div>
              <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--secondary-text)', fontStyle: 'italic' }}>*Los resultados son generados aleatoriamente en cada apertura.</p>
              <button className="btn-primary" onClick={() => setShowProbabilities(false)} style={{ width: '100%', marginTop: '20px' }}>CERRAR</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealedReward && (
          <MysteryBoxModal 
            reward={revealedReward} 
            onClose={() => setRevealedReward(null)} 
            isJackpotReward={revealedReward.amount === mbSettings?.jackpot_amount}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--success-green)',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              zIndex: 2000
            }}
          >
            <CheckCircle size={24} />
            <span style={{ fontWeight: 'bold' }}>¡Compra realizada con éxito!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ProbRow = ({ label, prob, icon }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--gray-bg)', borderRadius: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{label}</span>
    </div>
    <span style={{ color: 'var(--primary-red)', fontWeight: '900' }}>{(prob * 100).toFixed(0)}%</span>
  </div>
);

const MysteryBoxModal = ({ reward, onClose, isJackpotReward }: { reward: any, onClose: () => void, isJackpotReward: boolean }) => {
  const isRugPull = reward.type === 'rugpull';
  const isJackpot = isJackpotReward;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        style={{ 
          background: 'var(--card-bg)', 
          padding: '50px', 
          borderRadius: '40px', 
          maxWidth: '450px', 
          width: '100%', 
          textAlign: 'center',
          border: `5px solid ${isRugPull ? '#ff4b4b' : (isJackpot ? 'var(--star-yellow)' : 'var(--primary-red)')}`,
          boxShadow: `0 0 50px ${isRugPull ? 'rgba(255,75,75,0.3)' : (isJackpot ? 'rgba(255,215,0,0.5)' : 'rgba(229,57,53,0.3)')}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div 
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ position: 'absolute', inset: 0, background: isJackpot ? 'radial-gradient(circle, gold 0%, transparent 70%)' : 'none', pointerEvents: 'none' }} 
        />
        <motion.div
          animate={isJackpot ? { y: [0, -20, 0], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ fontSize: '100px', marginBottom: '30px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}
        >
          {reward.icon}
        </motion.div>
        <h2 style={{ fontSize: '32px', marginBottom: '15px', color: 'var(--text-color)', fontWeight: '900' }}>
          {isRugPull ? '¡OH NO!' : '¡ENHORABUENA!'}
        </h2>
        <p style={{ fontSize: '20px', color: 'var(--secondary-text)', marginBottom: '35px', lineHeight: '1.4' }}>
          {reward.msg}
        </p>
        <button 
          className="btn-primary" 
          onClick={onClose}
          style={{ 
            width: '100%', 
            padding: '20px', 
            fontSize: '18px', 
            borderRadius: '20px',
            background: isRugPull ? '#424242' : (isJackpot ? 'linear-gradient(45deg, gold, orange)' : 'var(--primary-red)'),
            border: 'none',
            boxShadow: `0 5px 0 ${isRugPull ? '#212121' : (isJackpot ? 'var(--primary-yellow-dark)' : 'var(--primary-red-dark)')}`
          }}
        >
          {isRugPull ? 'ACEPTAR MI DESTINO' : '¡BRUTAL! RECOGER'}
        </button>
      </motion.div>
    </div>
  );
};

function FeatureItem({ text }: { text: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '600' }}>
      <Check size={18} color="var(--primary-green)" strokeWidth={3} />
      <span>{text}</span>
    </li>
  );
}
