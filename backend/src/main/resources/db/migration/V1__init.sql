-- ================================
-- ADMINISTRADOR
-- ================================
CREATE TABLE IF NOT EXISTS administrador (
  id           INT          NOT NULL AUTO_INCREMENT,
  nivel_acesso INT          NOT NULL DEFAULT 1,
  email        VARCHAR(40)  NOT NULL UNIQUE,
  senha_hash   VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);
 
-- ================================
-- PROFESSOR
-- ================================
CREATE TABLE IF NOT EXISTS professor (
  id              INT          NOT NULL AUTO_INCREMENT,
  cpf             VARCHAR(16)  NOT NULL UNIQUE,
  email           VARCHAR(40)  NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,
  nome            VARCHAR(100) NOT NULL,
  telefone        VARCHAR(20),
  data_nascimento DATE,
  formacao        VARCHAR(255),
  PRIMARY KEY (id)
);
 
-- ================================
-- ALUNO
-- ================================
CREATE TABLE IF NOT EXISTS aluno (
  id              INT          NOT NULL AUTO_INCREMENT,
  cpf             VARCHAR(16)  NOT NULL UNIQUE,
  email           VARCHAR(40)  NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,
  nome            VARCHAR(100) NOT NULL,
  ra              VARCHAR(20)  NOT NULL UNIQUE,
  telefone        VARCHAR(20),
  data_nascimento DATE,
  PRIMARY KEY (id)
);
 
-- ================================
-- CURSO
-- ================================
CREATE TABLE IF NOT EXISTS curso (
  id             INT           NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(100)  NOT NULL,
  descricao      VARCHAR(500),
  ementa         VARCHAR(1000),
  carga_horaria  INT,
  numero_aulas   INT,
  preco          DECIMAL(10,2),
  media          DECIMAL(4,2),
  nota_avaliacao DECIMAL(4,2),
  professor_id   INT,
  url_banner      VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (professor_id) REFERENCES professor(id) ON DELETE SET NULL,
  FULLTEXT INDEX idx_curso_busca (nome, ementa)
);
 
-- ================================
-- VIDEO AULA
-- ================================
CREATE TABLE IF NOT EXISTS video_aula (
  id       INT          NOT NULL AUTO_INCREMENT,
  titulo   VARCHAR(100) NOT NULL,
  duracao  TIME,
  url      VARCHAR(255) NOT NULL,
  curso_id INT          NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE CASCADE
);
 
-- ================================
-- ATIVIDADE
-- ================================
CREATE TABLE IF NOT EXISTS atividade (
  id            INT          NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(100) NOT NULL,
  descricao     TEXT,
  video_aula_id INT          NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (video_aula_id) REFERENCES video_aula(id) ON DELETE CASCADE
);
 
-- ================================
-- RESPOSTA ATIVIDADE
-- ================================
CREATE TABLE IF NOT EXISTS resposta_atividade (
  id           INT          NOT NULL AUTO_INCREMENT,
  resposta     TEXT         NOT NULL,
  nota         DECIMAL(4,2),
  data_entrega DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  aluno_id     INT          NOT NULL,
  atividade_id INT          NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (aluno_id)     REFERENCES aluno(id)     ON DELETE CASCADE,
  FOREIGN KEY (atividade_id) REFERENCES atividade(id) ON DELETE CASCADE
);
 
-- ================================
-- MATRICULA
-- ================================
CREATE TABLE IF NOT EXISTS matricula (
  aluno_id             INT            NOT NULL,
  curso_id             INT            NOT NULL,
  media_final          DECIMAL(4,2),
  modalidade_pagamento ENUM('AVISTA','PARCELADO') NOT NULL DEFAULT 'AVISTA',
  numero_parcelas      INT            NOT NULL DEFAULT 1,
  status_pagamento     ENUM('PENDENTE','PAGO','CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  data_matricula       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (aluno_id, curso_id),
  FOREIGN KEY (aluno_id) REFERENCES aluno(id)  ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES curso(id)  ON DELETE CASCADE
);
 
-- ================================
-- PROGRESSO AULA
-- ================================
CREATE TABLE IF NOT EXISTS progresso_aula (
  aluno_id       INT      NOT NULL,
  video_aula_id  INT      NOT NULL,
  assistida      TINYINT(1) NOT NULL DEFAULT 0,
  data_conclusao DATETIME,
  PRIMARY KEY (aluno_id, video_aula_id),
  FOREIGN KEY (aluno_id)      REFERENCES aluno(id)      ON DELETE CASCADE,
  FOREIGN KEY (video_aula_id) REFERENCES video_aula(id) ON DELETE CASCADE
);
 
-- ================================
-- DUVIDA
-- ================================
CREATE TABLE IF NOT EXISTS duvida (
  id            INT      NOT NULL AUTO_INCREMENT,
  pergunta      TEXT     NOT NULL,
  resposta      TEXT,
  data_envio    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_resposta DATETIME,
  aluno_id      INT      NOT NULL,
  professor_id  INT,
  video_aula_id INT      NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (aluno_id)      REFERENCES aluno(id)      ON DELETE CASCADE,
  FOREIGN KEY (professor_id)  REFERENCES professor(id)  ON DELETE SET NULL,
  FOREIGN KEY (video_aula_id) REFERENCES video_aula(id) ON DELETE CASCADE
);
 
-- ================================
-- CERTIFICADO
-- ================================
CREATE TABLE IF NOT EXISTS certificado (
  id               INT         NOT NULL AUTO_INCREMENT,
  data_emissao     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  codigo_validacao VARCHAR(50) NOT NULL UNIQUE,
  aluno_id         INT         NOT NULL,
  curso_id         INT         NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (aluno_id) REFERENCES aluno(id)  ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES curso(id)  ON DELETE CASCADE
);