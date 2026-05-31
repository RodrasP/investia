import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import { 
  Zap, ShieldCheck, TrendingUp,
  MessageSquare, Globe, Award, Sparkles, BookOpen 
} from 'lucide-react';

// Block Icon Helper
const BlockIcon = ({ name, color = 'var(--primary-red)' }: { name: string, color?: string }) => {
  const icons: any = { Zap, ShieldCheck, TrendingUp, MessageSquare, Globe, Award, Sparkles, BookOpen };
  const IconComp = icons[name] || Zap;
  return <IconComp size={32} color={color} />;
};

// --- BLOCK COMPONENTS ---

const HeroBlock = ({ data }: any) => (
  <section style={{ 
    padding: '100px 20px', 
    background: data.imageUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${data.imageUrl.startsWith('http') ? data.imageUrl : API_BASE_URL + data.imageUrl}) center/cover no-repeat` : 'var(--gray-bg)',
    color: 'white',
    textAlign: 'center',
    borderRadius: '40px',
    marginBottom: '60px',
    marginTop: '40px'
  }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: '900', marginBottom: '20px', lineHeight: '1.1' }}>{data.title}</h1>
      <p style={{ fontSize: '20px', maxWidth: '800px', margin: '0 auto 40px', opacity: 0.9 }}>{data.subtitle}</p>
      {data.buttonText && (
        <Link to={data.buttonLink || '/register'} className="btn-primary" style={{ padding: '20px 50px', fontSize: '18px', textDecoration: 'none', display: 'inline-block' }}>
          {data.buttonText}
        </Link>
      )}
    </motion.div>
  </section>
);

const FeaturesBlock = ({ data }: any) => (
  <section style={{ padding: '60px 0', marginBottom: '60px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
      {data.items?.map((item: any, i: number) => (
        <motion.div 
          key={i}
          whileHover={{ y: -10 }}
          style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '30px', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div style={{ marginBottom: '20px', background: 'var(--accent-light)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BlockIcon name={item.icon} />
          </div>
          <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>{item.title}</h3>
          <p style={{ color: 'var(--secondary-text)', lineHeight: '1.6' }}>{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

const TextBlock = ({ data }: any) => (
  <section style={{ padding: '60px 0', maxWidth: '800px', margin: '0 auto', marginBottom: '60px' }}>
    <div 
      style={{ color: 'var(--text-color)', lineHeight: '1.8', fontSize: '18px' }} 
      dangerouslySetInnerHTML={{ __html: (data.content || '').replace(/\n/g, '<br />') }} 
    />
  </section>
);

const DynamicPage = ({ slug: propSlug }: { slug?: string }) => {
  const { slug: paramsSlug } = useParams();
  const slug = propSlug || paramsSlug || 'home';
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/pages/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
            data.blocks = JSON.parse(data.content);
        }
        setPage(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>Cargando página...</div>;
  if (!page) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>Página no encontrada</div>;

  return (
    <div className="container wide">
      <AnimatePresence mode="wait">
        <motion.div
          key={slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {page.blocks?.map((block: any, idx: number) => {
            if (!block) return null;
            switch (block.type) {
              case 'hero': return <HeroBlock key={idx} data={block} />;
              case 'features': return <FeaturesBlock key={idx} data={block} />;
              case 'text': return <TextBlock key={idx} data={block} />;
              default: return <div key={idx} style={{ padding: '20px', background: 'var(--gray-bg)', borderRadius: '10px', margin: '10px 0' }}>Bloque desconocido: {block.type}</div>;
            }
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DynamicPage;
