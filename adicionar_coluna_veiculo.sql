-- ═══════════════════════════════════════════════════════════════════════
-- Adiciona suporte à nova coluna "Veículo" na tabela de funcionários, e à
-- lista de veículos cadastrados (mesmo padrão já usado pra Nomes e Funções).
-- ═══════════════════════════════════════════════════════════════════════

-- Coluna do veículo, por funcionário, em cada RDO
alter table rdo_workers
  add column if not exists veiculo text;

-- Lista de veículos cadastrados, guardada junto com o RDO (mesmo padrão de
-- names_list e funcs_list que já existem)
alter table rdos
  add column if not exists vehicles_list jsonb default '[]'::jsonb;
