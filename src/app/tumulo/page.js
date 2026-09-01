'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

function TumuloDetails() {
  const searchParams = useSearchParams();
  const cemiterio = searchParams.get('cemiterio');
  const quadra = searchParams.get('quadra');
  const nr = searchParams.get('nr');
  const [ocupantes, setOcupantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cemiterio && quadra && nr) {
      supabase
        .from('obitos_v2')
        .select('*')
        .eq('cemiterio', cemiterio)
        .eq('quadra_setor', quadra)
        .eq('tumulo_jazigo', nr)
        .order('data_registro', { ascending: false })
        .then(({ data }) => {
          setOcupantes(data || []);
          setLoading(false);
        });
    }
  }, [cemiterio, quadra, nr]);

  return (
    <div className="min-h-screen text-slate-800 p-4 sm:p-8 pb-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-teal-700 hover:underline mb-8 font-medium bg-white/60 px-4 py-2 rounded-full">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Link>

        <div className="glass-panel rounded-3xl p-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-4 bg-teal-100/80 rounded-2xl">
              <MapPin className="w-8 h-8 text-teal-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-teal-900">Túmulo Nº {nr}</h1>
              <p className="text-teal-700 text-lg font-medium mt-1">
                Quadra {quadra} &bull; {cemiterio}
              </p>
            </div>
          </div>

          <div className="border-t border-white/40 pt-8">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-teal-800">
              <Users className="w-6 h-6 text-emerald-500" /> 
              {ocupantes.length} Registros encontrados neste jazigo
            </h2>

            {loading ? (
              <p className="text-slate-500">Buscando registros...</p>
            ) : (
              <div className="space-y-4">
                {ocupantes.map((o, idx) => (
                  <div key={o.id} className="p-6 rounded-2xl bg-white/60 border border-white/50 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="font-bold text-xl text-slate-800 mb-2">{o.inumados_completo}</div>
                      <div className="text-sm text-slate-600 font-medium">Data do Registro: {o.data_registro || 'Não informada'}</div>
                      {o.responsavel && (
                        <div className="text-sm text-slate-600 font-medium mt-1">Responsável: {o.responsavel} {o.contato_telefone ? `(${o.contato_telefone})` : ''}</div>
                      )}
                      {o.observacoes && (
                        <div className="text-sm text-slate-500 mt-2 bg-white/50 p-2 rounded">{o.observacoes}</div>
                      )}
                    </div>
                    <div className="text-5xl font-black text-teal-100/50">
                      #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TumuloPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <TumuloDetails />
    </Suspense>
  );
}
