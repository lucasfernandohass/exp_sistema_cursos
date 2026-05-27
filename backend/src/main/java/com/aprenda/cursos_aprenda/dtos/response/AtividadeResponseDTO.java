package com.aprenda.cursos_aprenda.dtos.response;

public record AtividadeResponseDTO(
    Integer id,
    String titulo,
    String descricao,
    Integer videoAulaId,
    boolean respondida   // preenchido com base nas respostas do aluno logado
) {}
 