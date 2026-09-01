-- 1. Cria a tabela principal
CREATE TABLE IF NOT EXISTS obitos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data_obito TEXT,
  cemiterio TEXT,
  numero_tumulo TEXT,
  quadra TEXT,
  nome_inumado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilita RLS
ALTER TABLE obitos ENABLE ROW LEVEL SECURITY;

-- 3. Cria as políticas de segurança abertas para facilitar o uso no MVP
CREATE POLICY "Permitir leitura anonima" ON obitos FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anonima" ON obitos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao anonima" ON obitos FOR UPDATE USING (true);
CREATE POLICY "Permitir delecao anonima" ON obitos FOR DELETE USING (true);
