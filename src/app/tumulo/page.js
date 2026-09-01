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
        .from('obitos')
        .select('*')
        .eq('cemiterio', cemiterio)
        .eq('quadra', quadra)
        .eq('numero_tumulo', nr)
        .order('data_obito', { ascending: false })
        .then(({ data }) => {
          setOcupantes(data || []);
          setLoading(false);
        });
    }
  }, [cemiterio, quadra, nr]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
              <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Túmulo Nº {nr}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Quadra {quadra} &bull; {cemiterio}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-8">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-gray-400" /> 
              {ocupantes.length} Inumados encontrados neste jazigo
            </h2>

            {loading ? (
              <p className="text-gray-500">Buscando registros...</p>
            ) : (
              <div className="space-y-4">
                {ocupantes.map((o, idx) => (
                  <div key={o.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">{o.nome_inumado}</div>
                      <div className="text-sm text-gray-500">Data de Óbito: {o.data_obito || 'Não informada'}</div>
                    </div>
                    <div className="text-4xl font-black text-gray-200 dark:text-gray-700">
                      {idx + 1}
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
