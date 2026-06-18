CREATE TABLE IF NOT EXISTS administrador (
  id           INT          NOT NULL AUTO_INCREMENT,
  nivel_acesso INT          NOT NULL DEFAULT 1,
  email        VARCHAR(40)  NOT NULL UNIQUE,
  senha_hash   VARCHAR(255) NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS professor (
  id              INT          NOT NULL AUTO_INCREMENT,
  cpf             VARCHAR(16)  NOT NULL UNIQUE,
  email           VARCHAR(40)  NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,
  nome            VARCHAR(100) NOT NULL,
  telefone        VARCHAR(20),
  data_nascimento DATE,
  formacao        VARCHAR(255),
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS aluno (
  id              INT          NOT NULL AUTO_INCREMENT,
  cpf             VARCHAR(16)  NOT NULL UNIQUE,
  email           VARCHAR(40)  NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,
  nome            VARCHAR(100) NOT NULL,
  ra              VARCHAR(20)  NOT NULL UNIQUE,
  telefone        VARCHAR(20),
  data_nascimento DATE,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS curso (
  id                 INT           NOT NULL AUTO_INCREMENT,
  nome               VARCHAR(100)  NOT NULL,
  descricao          VARCHAR(500),
  ementa             VARCHAR(5000),
  carga_horaria      INT,
  numero_aulas       INT,
  preco              DECIMAL(10,2),
  media              DECIMAL(4,2),
  nota_avaliacao     DECIMAL(4,2),
  numero_avaliacoes  INT,
  professor_id       INT,
  url_banner         VARCHAR(255)  NOT NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (professor_id) REFERENCES professor(id) ON DELETE SET NULL,
  FULLTEXT INDEX idx_curso_busca (nome, ementa)
);

CREATE TABLE IF NOT EXISTS video_aula (
  id         INT          NOT NULL AUTO_INCREMENT,
  titulo     VARCHAR(100) NOT NULL,
  duracao    TIME,
  url        VARCHAR(255) NOT NULL,
  curso_id   INT          NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS atividade (
  id            INT          NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(100) NOT NULL,
  descricao     TEXT,
  curso_id      INT          NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questao (
  id            INT          NOT NULL AUTO_INCREMENT,
  enunciado     TEXT         NOT NULL,
  ordem         INT          NOT NULL,
  atividade_id  INT          NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (atividade_id) REFERENCES atividade(id) ON DELETE CASCADE,
  INDEX idx_questao_atividade (atividade_id),
  INDEX idx_questao_ordem (ordem)
);

CREATE TABLE IF NOT EXISTS alternativa (
  id            INT          NOT NULL AUTO_INCREMENT,
  texto         TEXT         NOT NULL,
  ordem         INT          NOT NULL,
  correta       TINYINT(1)   NOT NULL DEFAULT 0,
  questao_id    INT          NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (questao_id) REFERENCES questao(id) ON DELETE CASCADE,
  INDEX idx_alternativa_questao (questao_id),
  INDEX idx_alternativa_ordem (ordem)
);

CREATE TABLE IF NOT EXISTS resposta_questao (
  id                INT          NOT NULL AUTO_INCREMENT,
  aluno_id          INT          NOT NULL,
  questao_id        INT          NOT NULL,
  alternativa_id    INT          NOT NULL,
  correta           TINYINT(1)   NOT NULL DEFAULT 0,
  data_resposta     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE CASCADE,
  FOREIGN KEY (questao_id) REFERENCES questao(id) ON DELETE CASCADE,
  FOREIGN KEY (alternativa_id) REFERENCES alternativa(id) ON DELETE CASCADE,
  UNIQUE KEY uk_resposta_questao_aluno (aluno_id, questao_id),
  INDEX idx_resposta_aluno (aluno_id),
  INDEX idx_resposta_questao (questao_id)
);

CREATE TABLE IF NOT EXISTS resposta_atividade_questoes (
  id                INT          NOT NULL AUTO_INCREMENT,
  aluno_id          INT          NOT NULL,
  atividade_id      INT          NOT NULL,
  nota              DECIMAL(4,2) NULL,
  questoes_corretas INT          NOT NULL DEFAULT 0,
  total_questoes    INT          NOT NULL DEFAULT 0,
  data_entrega      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE CASCADE,
  FOREIGN KEY (atividade_id) REFERENCES atividade(id) ON DELETE CASCADE,
  UNIQUE KEY uk_resposta_atividade_aluno (aluno_id, atividade_id),
  INDEX idx_resposta_atividade (atividade_id)
);

CREATE TABLE IF NOT EXISTS matricula (
  aluno_id             INT            NOT NULL,
  curso_id             INT            NOT NULL,
  avaliacao            INT            CHECK (avaliacao >= 1 AND avaliacao <= 5),
  media_final          DECIMAL(4,2),
  modalidade_pagamento ENUM('AVISTA','PARCELADO') NOT NULL DEFAULT 'AVISTA',
  numero_parcelas      INT            NOT NULL DEFAULT 1,
  status_pagamento     ENUM('PENDENTE','PAGO','CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  data_matricula       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo_cobranca        ENUM('BOLETO','LINK') NULL,
  codigo_cobranca      VARCHAR(80)    NULL,
  link_pagamento       VARCHAR(255)   NULL,
  data_cobranca        DATETIME       NULL,
  data_pagamento       DATETIME       NULL,
  created_at           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (aluno_id, curso_id),
  FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progresso_aula (
  aluno_id       INT      NOT NULL,
  video_aula_id  INT      NOT NULL,
  assistida      TINYINT(1) NOT NULL DEFAULT 0,
  data_conclusao DATETIME,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (aluno_id, video_aula_id),
  FOREIGN KEY (aluno_id)      REFERENCES aluno(id)      ON DELETE CASCADE,
  FOREIGN KEY (video_aula_id) REFERENCES video_aula(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS duvida (
  id            INT      NOT NULL AUTO_INCREMENT,
  pergunta      TEXT     NOT NULL,
  resposta      TEXT,
  data_envio    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_resposta DATETIME,
  aluno_id      INT      NOT NULL,
  professor_id  INT,
  video_aula_id INT      NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (aluno_id)      REFERENCES aluno(id)      ON DELETE CASCADE,
  FOREIGN KEY (professor_id)  REFERENCES professor(id)  ON DELETE SET NULL,
  FOREIGN KEY (video_aula_id) REFERENCES video_aula(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certificado (
  id               INT         NOT NULL AUTO_INCREMENT,
  data_emissao     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  codigo_validacao VARCHAR(50) NOT NULL UNIQUE,
  aluno_id         INT         NOT NULL,
  curso_id         INT         NOT NULL,
  conteudo_pdf     LONGBLOB,                     -- <-- NOVA COLUNA
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE CASCADE
);