CREATE DATABASE IF NOT EXISTS curso_aprenda
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE curso_aprenda;

CREATE TABLE IF NOT EXISTS administrador (
  id           INT          NOT NULL AUTO_INCREMENT,
  nivel_acesso INT          NOT NULL DEFAULT 1,
  email        VARCHAR(40)  NOT NULL UNIQUE,
  senha_hash   VARCHAR(255) NOT NULL,
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
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS curso (
  id             INT           NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(100)  NOT NULL,
  ementa         VARCHAR(1000),
  carga_horaria  INT,
  numero_aulas   INT,
  preco          DECIMAL(10,2),
  media          DECIMAL(4,2),
  nota_avaliacao DECIMAL(4,2),
  professor_id   INT,
  PRIMARY KEY (id),
  FOREIGN KEY (professor_id) REFERENCES professor(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS video_aula (
  id       INT          NOT NULL AUTO_INCREMENT,
  titulo   VARCHAR(100) NOT NULL,
  duracao  TIME,
  url      VARCHAR(255) NOT NULL,
  curso_id INT          NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matricula (
  aluno_id         INT        NOT NULL,
  curso_id         INT        NOT NULL,
  media_final      DECIMAL(4,2),
  status_pagamento TINYINT(1) NOT NULL DEFAULT 0,
  data_matricula   DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (aluno_id, curso_id),
  FOREIGN KEY (aluno_id) REFERENCES aluno(id)  ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES curso(id)  ON DELETE CASCADE
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
  PRIMARY KEY (id),
  FOREIGN KEY (aluno_id)      REFERENCES aluno(id)      ON DELETE CASCADE,
  FOREIGN KEY (professor_id)  REFERENCES professor(id)  ON DELETE SET NULL,
  FOREIGN KEY (video_aula_id) REFERENCES video_aula(id) ON DELETE CASCADE
);

-- Dados iniciais
INSERT IGNORE INTO administrador (nivel_acesso, email, senha_hash)
  VALUES (1, 'admin@cursoonline.com', '0e0c9035898dd52fc65fbcaaae1bde0');