'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ExcelUploader from '@/components/ExcelUploader';
import { Search, Plus, Trash2, MapPin, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [obitos, setObitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Manual entry states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome_inumado: '', data_obito: '', cemiterio: '', quadra: '', numero_tumulo: ''
  });
  const router = useRouter();

  const fetchObitos = async () => {
    setLoading(true);
    let query = supabase.from('obitos').select('*').order('created_at', { ascending: false }).limit(50);
    
    if (searchTerm) {
      query = query.ilike('nome_inumado', `%${searchTerm}%`);
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
    const { error } = await supabase.from('obitos').insert([formData]);
    if (!error) {
      setFormData({ nome_inumado: '', data_obito: '', cemiterio: '', quadra: '', numero_tumulo: '' });
      setShowForm(false);
      fetchObitos();
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja deletar este registro?')) {
      await supabase.from('obitos').delete().eq('id', id);
      fetchObitos();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <MapPin className="w-6 h-6" />
            Sistema de Cemitérios
          </h1>
          <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-500">
            Sair
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Upload Section */}
        <section>
          <ExcelUploader onUploadComplete={fetchObitos} />
        </section>

        {/* Actions & Search */}
        <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nome do inumado..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Registro Manual
          </button>
        </section>

        {/* Manual Form */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <input required placeholder="Nome do Inumado" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" value={formData.nome_inumado} onChange={e=>setFormData({...formData, nome_inumado: e.target.value})} />
            <input placeholder="Ano/Data Óbito" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" value={formData.data_obito} onChange={e=>setFormData({...formData, data_obito: e.target.value})} />
            <input placeholder="Cemitério" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" value={formData.cemiterio} onChange={e=>setFormData({...formData, cemiterio: e.target.value})} />
            <input placeholder="Quadra" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" value={formData.quadra} onChange={e=>setFormData({...formData, quadra: e.target.value})} />
            <input placeholder="Nº Túmulo" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" value={formData.numero_tumulo} onChange={e=>setFormData({...formData, numero_tumulo: e.target.value})} />
            <button type="submit" className="md:col-span-5 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium">Salvar Registro</button>
          </form>
        )}

        {/* Data Table */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 font-semibold">Inumado</th>
                  <th className="p-4 font-semibold">Data Óbito</th>
                  <th className="p-4 font-semibold">Cemitério</th>
                  <th className="p-4 font-semibold">Quadra</th>
                  <th className="p-4 font-semibold">Nº</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">Carregando...</td></tr>
                ) : obitos.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">Nenhum registro encontrado.</td></tr>
                ) : obitos.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="p-4 font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" /> {o.nome_inumado}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" /> {o.data_obito || '-'}
                      </div>
                    </td>
                    <td className="p-4">{o.cemiterio}</td>
                    <td className="p-4">{o.quadra}</td>
                    <td className="p-4 font-mono">{o.numero_tumulo}</td>
                    <td className="p-4 text-right space-x-3">
                      <Link 
                        href={`/tumulo?cemiterio=${encodeURIComponent(o.cemiterio)}&quadra=${encodeURIComponent(o.quadra)}&nr=${encodeURIComponent(o.numero_tumulo)}`}
                        className="text-blue-600 hover:underline font-medium text-xs uppercase"
                      >
                        Ver Túmulo
                      </Link>
                      <button onClick={() => handleDelete(o.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
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
