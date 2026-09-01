'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ExcelUploader from '@/components/ExcelUploader';
import { Search, Plus, Trash2, MapPin, Calendar, User, Grid, Hash, Cross } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [obitos, setObitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cemiterio: '', inumados_completo: '', tumulo_jazigo: '', quadra_setor: '', data_registro: '', responsavel: '', contato_telefone: ''
  });
  const router = useRouter();

  const fetchObitos = async () => {
    setLoading(true);
    let query = supabase.from('obitos_v2').select('*').order('created_at', { ascending: false }).limit(50);
    
    if (searchTerm) {
      query = query.ilike('inumados_completo', `%${searchTerm}%`);
    }

    const { data } = await query;
    setObitos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchObitos();
  }, [searchTerm]);

  const handleLogout = () => {
    document.cookie = "cmt_auth=; path=/; max-age=0";
    router.push('/login');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('obitos_v2').insert([formData]);
    if (!error) {
      setFormData({ cemiterio: '', inumados_completo: '', tumulo_jazigo: '', quadra_setor: '', data_registro: '', responsavel: '', contato_telefone: '' });
      setShowForm(false);
      fetchObitos();
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja deletar este registro?')) {
      await supabase.from('obitos_v2').delete().eq('id', id);
      fetchObitos();
    }
  };

  return (
    <div className="min-h-screen text-slate-800 pb-16">
      <nav className="glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-teal-700">
            <span className="bg-teal-100 p-2 rounded-full">🌿</span>
            Paz e Memória (V2)
          </h1>
          <button onClick={handleLogout} className="text-sm font-medium text-rose-500 hover:text-rose-600">
            Sair do Sistema
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <section className="glass-panel rounded-2xl overflow-hidden p-1">
          <ExcelUploader onUploadComplete={fetchObitos} />
        </section>

        <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar pelo nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-panel rounded-full focus:ring-2 focus:ring-teal-400 outline-none placeholder-slate-400"
            />
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg shadow-teal-500/30"
          >
            <Plus className="w-5 h-5" />
            Novo Registro Manual
          </button>
        </section>

        {showForm && (
          <form onSubmit={handleAdd} className="glass-panel p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input required placeholder="Nomes dos Inumados" className="p-3 bg-white/60 border border-white rounded-xl outline-none focus:ring-2 focus:ring-teal-400" value={formData.inumados_completo} onChange={e=>setFormData({...formData, inumados_completo: e.target.value})} />
            <input placeholder="Cemitério" className="p-3 bg-white/60 border border-white rounded-xl outline-none focus:ring-2 focus:ring-teal-400" value={formData.cemiterio} onChange={e=>setFormData({...formData, cemiterio: e.target.value})} />
            <input placeholder="Nº Túmulo" className="p-3 bg-white/60 border border-white rounded-xl outline-none focus:ring-2 focus:ring-teal-400" value={formData.tumulo_jazigo} onChange={e=>setFormData({...formData, tumulo_jazigo: e.target.value})} />
            <input placeholder="Quadra" className="p-3 bg-white/60 border border-white rounded-xl outline-none focus:ring-2 focus:ring-teal-400" value={formData.quadra_setor} onChange={e=>setFormData({...formData, quadra_setor: e.target.value})} />
            <input placeholder="Data do Registro" className="p-3 bg-white/60 border border-white rounded-xl outline-none focus:ring-2 focus:ring-teal-400" value={formData.data_registro} onChange={e=>setFormData({...formData, data_registro: e.target.value})} />
            <input placeholder="Responsável" className="p-3 bg-white/60 border border-white rounded-xl outline-none focus:ring-2 focus:ring-teal-400" value={formData.responsavel} onChange={e=>setFormData({...formData, responsavel: e.target.value})} />
            <button type="submit" className="md:col-span-3 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium shadow-md">Salvar Registro no Banco</button>
          </form>
        )}

        <section className="glass-panel rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-teal-50/80 border-b border-teal-100">
                <tr>
                  <th className="p-4 font-semibold text-teal-800 rounded-tl-2xl">Cemitério</th>
                  <th className="p-4 font-semibold text-teal-800">Inumados</th>
                  <th className="p-4 font-semibold text-teal-800">Nº Túmulo</th>
                  <th className="p-4 font-semibold text-teal-800">Quadra</th>
                  <th className="p-4 font-semibold text-teal-800">Data / Contato</th>
                  <th className="p-4 font-semibold text-teal-800 text-right rounded-tr-2xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">Carregando registros consolidados...</td></tr>
                ) : obitos.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">Nenhum registro encontrado.</td></tr>
                ) : obitos.map((o) => (
                  <tr key={o.id} className="hover:bg-white/60 transition-colors">
                    <td className="p-4 font-medium text-teal-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 opacity-50" /> {o.cemiterio}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 flex items-center gap-2 whitespace-normal min-w-[300px]">
                      <User className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {o.inumados_completo}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" /> <span className="font-mono bg-white/50 px-2 py-1 rounded-md">{o.tumulo_jazigo || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Grid className="w-4 h-4 text-slate-400" /> {o.quadra_setor || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-slate-600 text-sm">
                        <span><Calendar className="w-3 h-3 inline opacity-50" /> {o.data_registro || '-'}</span>
                        {o.responsavel && <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded">Resp: {o.responsavel}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-4">
                      <Link 
                        href={`/tumulo?cemiterio=${encodeURIComponent(o.cemiterio)}&quadra=${encodeURIComponent(o.quadra_setor)}&nr=${encodeURIComponent(o.tumulo_jazigo)}`}
                        className="text-teal-600 hover:text-teal-800 font-medium text-sm transition-colors"
                      >
                        Ver Jazigo
                      </Link>
                      <button onClick={() => handleDelete(o.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
