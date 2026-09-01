const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const dir = path.join(__dirname, 'Cemiterio');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));
  
  let totalInserted = 0;

  for (const file of files) {
    if (file.startsWith('~$')) continue; // skip temp files
    console.log(`\nProcessando: ${file}...`);
    
    const filePath = path.join(dir, file);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    const recordsToInsert = [];
    
    // Detect Format
    let isFormatA = false; // Tabular (Parque da Saudade)
    let isFormatB = false; // Mapeamento (Rosario/Santissimo)
    
    if (data.length > 1 && data[1] && data[1][0] === 'DATA' && data[1][1] === 'CEMITERIO') {
      isFormatA = true;
    } else if (data[0] && String(data[0][0]).includes('MAPEAMENTO')) {
      isFormatB = true;
    } else if (file.toUpperCase().includes('RECADASTRAMENTO')) {
      // Let's check format of recadastramento
      // Assume tabular format similar to A for now, but need to find headers
      let headerRow = -1;
      for (let i=0; i<10; i++) {
        if (data[i] && data[i].includes('INUMADO') || data[i].includes('INUMADOS')) {
          headerRow = i;
          break;
        }
      }
      if (headerRow !== -1) {
        if (data[headerRow].includes('DATA') && data[headerRow].includes('CEMITERIO')) {
          isFormatA = true;
        } else {
          isFormatB = true; // Fallback
        }
      }
    }

    if (isFormatA) {
      console.log('-> Detectado Formato A (Tabela Padrão)');
      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        const data_obito = String(row[0] || '').trim();
        const cemiterio = String(row[1] || '').trim();
        const numero_tumulo = String(row[2] || '').trim();
        const quadra = String(row[4] || '').trim(); // col 4 is quadra
        const nome_inumado = String(row[5] || '').trim();
        
        if (nome_inumado && cemiterio) {
          recordsToInsert.push({ data_obito, cemiterio, numero_tumulo, quadra, nome_inumado });
        }
      }
    } else if (isFormatB || String(data[1]?.[0]).includes('TUMULO')) {
      console.log('-> Detectado Formato B (Mapeamento Quadras)');
      let currentQuadra = '';
      let cemiterio = String(data[0][0]).replace('MAPEAMENTO CEMITÉRIO DO ', '').replace('MAPEAMENTO CEMITERIO DO ', '').trim();
      
      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        const col0 = String(row[0] || '').trim();
        const inumadosRaw = String(row[2] || row[1] || '').trim(); // sometimes in col 1 or 2
        
        if (col0.toUpperCase().startsWith('QUADRA')) {
          currentQuadra = col0.replace('QUADRA', '').replace('-', '').trim();
          continue;
        }
        
        if (col0 && !isNaN(parseInt(col0)) && inumadosRaw) {
          const numero_tumulo = col0;
          // split names by comma or " E "
          const names = inumadosRaw.split(/,| E | e /).map(n => n.trim()).filter(n => n.length > 2);
          
          for (const name of names) {
            recordsToInsert.push({
              data_obito: '',
              cemiterio: cemiterio,
              numero_tumulo,
              quadra: currentQuadra,
              nome_inumado: name
            });
          }
        }
      }
    } else {
      console.log('Formato não reconhecido, tentando leitura genérica...');
      // Generic read for RECADASTRAMENTO
      let cemiterio = file.toUpperCase().includes('SAUDADE') ? 'PARQUE DA SAUDADE' : 'DESCONHECIDO';
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        const nome = String(row[1] || row[2] || '').trim(); // GUESS
        if (nome && nome.length > 3) {
          recordsToInsert.push({
            data_obito: String(row[0] || '').trim(),
            cemiterio: cemiterio,
            numero_tumulo: String(row[3] || '').trim(),
            quadra: String(row[4] || '').trim(),
            nome_inumado: nome
          });
        }
      }
    }

    console.log(`Encontrados ${recordsToInsert.length} registros válidos.`);
    
    if (recordsToInsert.length > 0) {
      const chunkSize = 1000;
      for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
        const chunk = recordsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('obitos').insert(chunk);
        if (error) {
          console.error('Erro ao inserir:', error);
        } else {
          totalInserted += chunk.length;
          process.stdout.write(`\rInseridos ${i + chunk.length} de ${recordsToInsert.length}...`);
        }
      }
      console.log('\nFinalizado arquivo.');
    }
  }
  
  console.log(`\n\n=== SUCESSO! TOTAL DE ÓBITOS CADASTRADOS: ${totalInserted} ===`);
}

run();
