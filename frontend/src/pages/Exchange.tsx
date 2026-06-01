import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, ArrowRightLeft, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import BullCoin from '../components/BullCoin';
import VestiaBill from '../components/VestiaBill';
import Tutorial from '../components/Tutorial';

export default function Exchange({ user, setUser, language = 'es' }: { user: any, setUser: any, language?: string }) {
  const [rateData, setRateData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [timeframe, setTimeframe] = useState<'1h' | '1d' | '1w' | '1m'>('1h');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchRate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/exchange/rate?timeframe=${timeframe}`);
      const data = await res.json();
      setRateData(data);
      setLoading(false);
    } catch (err) {}
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/exchange/transactions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setTransactions(await res.json());
    } catch (err) {}
  };

  useEffect(() => {
    fetchRate();
    fetchTransactions();
    const interval = setInterval(fetchRate, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [timeframe]);

  const handleExchange = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!amount || isNaN(parseFloat(amount))) {
      return;
    }
    setProcessing(true);
    
    const endpoint = activeTab === 'buy' ? 'buy-trs' : 'sell-trs';
    const body = activeTab === 'buy' ? { amountVST: parseFloat(amount) } : { amountTRS: parseFloat(amount) };

    try {
      const res = await fetch(`${API_BASE_URL}/api/exchange/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(data.message);
        fetchTransactions();
        const userRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (userRes.ok) setUser(await userRes.json());
        
        setAmount('');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Error processing transaction');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando Exchange...</div>;

  const currentPrice = rateData?.current?.price || 1.0;
  const history = rateData?.history || [];
  
  // Calculate price change relative to the START of the current timeframe
  const timeframePriceChange = history.length > 0 ? ((currentPrice - history[0].price) / history[0].price) * 100 : 0;

  // Simple Sparkline
  const maxPrice = Math.max(...history.map((h: any) => h.price), currentPrice);
  const minPrice = Math.min(...history.map((h: any) => h.price), currentPrice);
  const range = maxPrice - minPrice || 1;

  const points = history.map((h: any, i: number) => {
    const x = (i / (history.length - 1)) * 100;
    const y = 100 - ((h.price - minPrice) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="container wide" style={{ padding: '40px 20px' }}>
      <Tutorial 
        pageId="exchange"
        language={language}
        user={user}
        setUser={setUser}
        steps={[
          { text: language === 'en' ? 'In the Exchange, you can trade your earned Toros for Vestias and vice versa.' : 'En el Exchange puedes intercambiar tus Toros ganados por Vestias y viceversa.' },
          { text: language === 'en' ? 'Watch the real-time chart to see how the conversion rate fluctuates.' : 'Observa la gráfica en tiempo real para ver cómo fluctúa el valor de conversión.' },
          { text: language === 'en' ? 'Enter the amount you want to exchange and confirm your trade below.' : 'Introduce la cantidad que quieres cambiar y confirma tu operación abajo.' }
        ]}
      />
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(76, 175, 80, 0.1)', color: '#2E7D32', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '15px' }}
        >
          <ArrowRightLeft size={20} />
          <span>INVESTIA EXCHANGE</span>
        </motion.div>
        <h1 style={{ fontSize: '42px', marginBottom: '15px' }}>Mercado de Toros (TRS)</h1>
        <p style={{ color: 'var(--secondary-text)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Intercambia tus Vestias (VST) por Toros (TRS) y aprovecha las fluctuaciones del mercado.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '60px' }}>
        {/* Chart Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ background: 'var(--card-bg)', borderRadius: '30px', padding: '30px', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--secondary-text)', textTransform: 'uppercase' }}>Precio Actual</div>
              <div style={{ fontSize: '36px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                1 <BullCoin size={28} /> = {currentPrice.toFixed(2)} <VestiaBill size={24} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: timeframePriceChange >= 0 ? 'var(--success-green)' : 'var(--error-red)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                justifyContent: 'flex-end'
              }}>
                {timeframePriceChange >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {timeframePriceChange >= 0 ? '+' : ''}{timeframePriceChange.toFixed(2)}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Variación en {timeframe}</div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div style={{ display: 'flex', gap: '5px', background: 'var(--gray-bg)', padding: '4px', borderRadius: '10px', marginBottom: '25px', width: 'fit-content' }}>
            {(['1h', '1d', '1w', '1m'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: timeframe === tf ? 'var(--card-bg)' : 'transparent',
                  color: timeframe === tf ? 'var(--primary-red)' : 'var(--secondary-text)',
                  fontSize: '12px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: timeframe === tf ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          <div style={{ height: '240px', width: '100%', position: 'relative', background: 'var(--gray-bg)', borderRadius: '15px', overflow: 'hidden', padding: '20px' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={timeframePriceChange >= 0 ? '#4CAF50' : '#FF4B4B'} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={timeframePriceChange >= 0 ? '#4CAF50' : '#FF4B4B'} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke={timeframePriceChange >= 0 ? 'var(--success-green)' : 'var(--error-red)'}
                strokeWidth="1.2"
                points={points}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <polygon
                fill="url(#gradient)"
                points={`${points} 100,100 0,100`}
              />
            </svg>
          </div>
        </motion.div>

        {/* Exchange Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ background: 'var(--card-bg)', borderRadius: '30px', padding: '30px', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', background: 'var(--gray-bg)', padding: '5px', borderRadius: '15px', marginBottom: '25px' }}>
            <button 
              onClick={() => setActiveTab('buy')}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: activeTab === 'buy' ? 'var(--card-bg)' : 'transparent', color: activeTab === 'buy' ? 'var(--primary-red)' : 'var(--secondary-text)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              COMPRAR TRS
            </button>
            <button 
              onClick={() => setActiveTab('sell')}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: activeTab === 'sell' ? 'var(--card-bg)' : 'transparent', color: activeTab === 'sell' ? 'var(--primary-red)' : 'var(--secondary-text)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              VENDER TRS
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--secondary-text)' }}>
                  {activeTab === 'buy' ? 'Gastar Vestias (VST)' : 'Vender Toros (TRS)'}
                </label>
                <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                  Saldo: {activeTab === 'buy' ? `${(user?.vestias || 0).toFixed(2)} VST` : `${(user?.points || 0)} TRS`}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '18px', fontWeight: 'bold' }}
                />
                <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }}>
                  {activeTab === 'buy' ? <VestiaBill size={20} /> : <BullCoin size={20} />}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <ArrowRightLeft size={24} style={{ color: 'var(--secondary-text)', opacity: 0.5 }} />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--secondary-text)', marginBottom: '8px' }}>Recibirás (estimado)</div>
              <div style={{ padding: '15px', borderRadius: '15px', background: 'var(--gray-bg)', border: '1px solid var(--border-color)', fontSize: '20px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeTab === 'buy' 
                  ? `${(parseFloat(amount || '0') / currentPrice).toFixed(0)} TRS` 
                  : `${(parseFloat(amount || '0') * currentPrice).toFixed(2)} VST`
                }
                {activeTab === 'buy' ? <BullCoin size={20} /> : <VestiaBill size={20} />}
              </div>
            </div>
          </div>

          <button 
            className="btn-primary" 
            disabled={processing || !amount}
            onClick={handleExchange}
            style={{ width: '100%', padding: '18px', fontSize: '16px' }}
          >
            {processing ? 'PROCESANDO...' : activeTab === 'buy' ? 'COMPRAR TOROS' : 'VENDER TOROS'}
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: 'var(--success-green)', color: 'white', padding: '15px 30px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 2000 }}
          >
            <CheckCircle size={24} />
            <span style={{ fontWeight: 'bold' }}>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '30px', border: '2px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ background: 'var(--accent-light)', padding: '15px', borderRadius: '50%', color: 'var(--primary-red)' }}>
          <Info size={32} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 5px 0' }}>¿Cómo funciona el Exchange?</h3>
          <p style={{ margin: 0, color: 'var(--secondary-text)', fontSize: '14px' }}>
            El precio de los Toros (TRS) fluctúa en tiempo real respecto a las Vestias (VST). 
            Usa tus Vestias para comprar Toros cuando el precio esté bajo y véndelos cuando suba para obtener beneficios. 
            ¡Toda una simulación de inversión real!
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '30px', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
           <ArrowRightLeft size={20} color="var(--primary-red)" />
           <h2 style={{ margin: 0, fontSize: '24px' }}>Historial de Operaciones</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--gray-bg)' }}>
                <th style={{ padding: '15px' }}>Fecha</th>
                <th style={{ padding: '15px' }}>Tipo</th>
                <th style={{ padding: '15px' }}>Cantidad (TRS)</th>
                <th style={{ padding: '15px' }}>Total (VST)</th>
                <th style={{ padding: '15px' }}>Precio</th>
                <th style={{ padding: '15px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
                    Aún no has realizado ninguna operación.
                  </td>
                </tr>
              ) : transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px', fontSize: '13px' }}>
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      background: tx.type === 'buy' ? 'rgba(88, 204, 2, 0.1)' : 'rgba(229, 57, 53, 0.1)',
                      color: tx.type === 'buy' ? 'var(--success-green)' : 'var(--primary-red)'
                    }}>
                      {tx.type === 'buy' ? 'COMPRA' : 'VENTA'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>
                    {tx.type === 'buy' ? '+' : '-'}{tx.amount_trs} TRS
                  </td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>
                    {tx.type === 'buy' ? '-' : '+'}{tx.amount_vst.toFixed(2)} VST
                  </td>
                  <td style={{ padding: '15px', color: 'var(--secondary-text)' }}>
                    {tx.price.toFixed(4)}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success-green)', fontSize: '12px', fontWeight: 'bold' }}>
                      <CheckCircle size={14} /> EJECUTADA
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
