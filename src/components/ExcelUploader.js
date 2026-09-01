'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExcelUploader({ onUploadComplete }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);
    setMessage('Lendo arquivo Excel...');
    setProgress(10);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convert to JSON, starting from the header row
      // We assume the header has DATA, CEMITERIO, NR, QUADRA, INUMADO
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      setProgress(30);
      setMessage(`Processando ${jsonData.length} linhas...`);

      const recordsToInsert = [];
      
      for (const row of jsonData) {
        // Map according to the columns shown in the user's screenshot
        const data_obito = String(row['DATA'] || '').trim();
        const cemiterio = String(row['CEMITERIO'] || '').trim();
        const numero_tumulo = String(row['NR'] || '').trim();
        const quadra = String(row['QUADRA'] || '').trim();
        const nome_inumado = String(row['INUMADO'] || '').trim();

        if (nome_inumado && cemiterio) {
          recordsToInsert.push({
            data_obito,
            cemiterio,
            numero_tumulo,
            quadra,
            nome_inumado
          });
        }
      }

      setProgress(50);
      setMessage(`Enviando ${recordsToInsert.length} registros válidos para o banco... Isso pode demorar.`);

      // Batch insert in chunks of 1000
      const chunkSize = 1000;
      for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
        const chunk = recordsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('obitos').insert(chunk);
        
        if (error) throw error;
        
        setProgress(50 + Math.round(((i + chunk.length) / recordsToInsert.length) * 50));
      }

      setStatus('success');
      setMessage(`${recordsToInsert.length} óbitos cadastrados com sucesso!`);
      if (onUploadComplete) onUploadComplete();
      
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Erro ao processar: ' + error.message);
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = null;
    }
  };

  return (
    <div className="glass-panel p-8 text-slate-800">
      <h3 className="text-xl font-bold mb-6 text-teal-700 flex items-center gap-3">
        <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
        Importar Nova Planilha (Excel)
      </h3>
      
      <div className="relative">
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${loading ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className="text-blue-600 dark:text-blue-400 font-medium">{message}</p>
              <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">Clique ou arraste a planilha aqui</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Arquivos suportados: .xlsx, .xls</p>
            </div>
          )}
        </div>
      </div>

      {status === 'success' && !loading && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {message}
        </div>
      )}
      
      {status === 'error' && !loading && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {message}
        </div>
      )}
    </div>
  );
}
