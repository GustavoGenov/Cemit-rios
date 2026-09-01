-- 1. Cria a nova tabela com a estrutura consolidada
CREATE TABLE IF NOT EXISTS obitos_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_registro TEXT,
  cemiterio TEXT,
  tumulo_jazigo TEXT,
  quadra_setor TEXT,
  inumados_completo TEXT,
  status_jazigo TEXT,
  quantidade_inumados INTEGER,
  data_registro TEXT,
  ano_registro INTEGER,
  responsavel TEXT,
  contato_telefone TEXT,
  cpf_rg TEXT,
  email TEXT,
  tipo_registro TEXT,
  observacoes TEXT,
  fonte_arquivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilita RLS
ALTER TABLE obitos_v2 ENABLE ROW LEVEL SECURITY;

-- 3. Cria as políticas de segurança abertas para facilitar o uso
CREATE POLICY "Permitir leitura anonima" ON obitos_v2 FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anonima" ON obitos_v2 FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao anonima" ON obitos_v2 FOR UPDATE USING (true);
CREATE POLICY "Permitir delecao anonima" ON obitos_v2 FOR DELETE USING (true);
