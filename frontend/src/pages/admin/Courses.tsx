import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Book, ChevronRight, Pencil, Trash, Filter } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { CourseIcon, FilterDropdown } from './Common';
import toast from 'react-hot-toast';

export default function Courses({ onSelectCourse, onEditCourse, onCreateCourse }: any) {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(['all']);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchCourses = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/courses`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setCourses(await res.json());
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/settings/categories`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setCategories(await res.json());
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [fetchCourses, fetchCategories]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este curso permanentemente?')) return;
    const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toast.success('Curso eliminado');
      fetchCourses();
    }
  };

  const filtered = courses.filter(c => 
    ((c.title || '').toLowerCase().includes(search.toLowerCase()) || 
     (c.category || '').toLowerCase().includes(search.toLowerCase())) && 
    (selectedCategory.includes('all') || selectedCategory.includes(c.category))
  );

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    ...categories.map(c => ({ value: c.name, label: c.name }))
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '950', margin: 0 }}>Catálogo Educativo</h2>
          <p style={{ color: 'var(--secondary-text)', margin: '5px 0 0', fontSize: '15px' }}>Gestiona el contenido, precios y visibilidad de los cursos</p>
        </div>
        <button onClick={onCreateCourse} className="btn-primary" style={{ padding: '12px 25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={22} /> NUEVO CURSO
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '35px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Buscar por título o categoría..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: '600' }}
          />
        </div>
        <FilterDropdown 
          value={selectedCategory}
          options={categoryOptions}
          onChange={setSelectedCategory}
          icon={Filter}
          label="Filtrar Categoría"
          multi
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '35px' }}>
        {filtered.map(course => (
          <motion.div 
            key={course.id} 
            whileHover={{ y: -12, boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}
            className="card" 
            style={{ 
              padding: '0', 
              borderRadius: '35px', 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative', 
              overflow: 'hidden', 
              border: '2px solid var(--border-color)',
              background: 'var(--card-bg)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ height: '6px', width: '100%', background: course.visibility === 'public' ? 'linear-gradient(90deg, #4CAF50, #81C784)' : 'linear-gradient(90deg, #9E9E9E, #BDBDBD)' }} />
            
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                 <div style={{ width: '65px', height: '60px', borderRadius: '20px', background: 'rgba(229, 57, 53, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)', border: '1px solid rgba(229, 57, 53, 0.1)' }}>
                    <CourseIcon name={course.icon} size={32} />
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button 
                      whileHover={{ scale: 1.1, background: 'var(--gray-bg)' }}
                      onClick={() => onEditCourse(course)}
                      style={{ width: '45px', height: '45px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}
                    >
                       <Pencil size={18} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1, background: 'rgba(244, 67, 54, 0.1)' }}
                      onClick={() => handleDelete(course.id)} 
                      style={{ width: '45px', height: '45px', borderRadius: '14px', border: '2px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)' }}
                    >
                       <Trash size={18} />
                    </motion.button>
                 </div>
              </div>

              <div>
                 <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '9px', fontWeight: '950', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary-red)', padding: '5px 12px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{course.difficulty}</span>
                    <span style={{ fontSize: '9px', fontWeight: '950', background: 'var(--gray-bg)', color: 'var(--secondary-text)', padding: '5px 12px', borderRadius: '10px', textTransform: 'uppercase', border: '1px solid var(--border-color)' }}>{course.category}</span>
                    {course.access_level === 'premium' && (
                      <span style={{ fontSize: '9px', fontWeight: '950', background: 'linear-gradient(45deg, #FFD700, #FFA500)', color: 'rgba(0,0,0,0.7)', padding: '5px 12px', borderRadius: '10px' }}>PREMIUM</span>
                    )}
                 </div>
                 <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', lineHeight: '1.2' }}>{course.title}</h3>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--secondary-text)', lineHeight: '1.6', margin: '15px 0 25px', height: '65px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', fontWeight: '500' }}>
                {course.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-bg)', padding: '15px 20px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Book size={14} color="var(--primary-red)" />
                       <span style={{ fontSize: '13px', fontWeight: '800' }}>{course.lesson_count || 0} lecciones</span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: course.points_price > 0 ? '#FF9800' : 'var(--primary-green)', marginLeft: '20px' }}>
                       {course.points_price > 0 ? `${course.points_price} TRS` : 'GRATIS'}
                    </div>
                 </div>
                 <motion.button 
                   whileHover={{ x: 5 }}
                   onClick={() => onSelectCourse(course)} 
                   style={{ padding: '10px 18px', borderRadius: '14px', fontSize: '12px', fontWeight: '900', background: 'var(--card-bg)', border: '2px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)' }}
                 >
                    GESTIONAR <ChevronRight size={14} />
                 </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
