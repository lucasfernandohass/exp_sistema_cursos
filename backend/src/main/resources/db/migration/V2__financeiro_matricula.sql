ALTER TABLE matricula
  ADD COLUMN tipo_cobranca ENUM('BOLETO','LINK') NULL,
  ADD COLUMN codigo_cobranca VARCHAR(80) NULL,
  ADD COLUMN link_pagamento VARCHAR(255) NULL,
  ADD COLUMN data_cobranca DATETIME NULL,
  ADD COLUMN data_pagamento DATETIME NULL;
