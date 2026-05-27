package com.aprenda.cursos_aprenda.dtos.response;

import java.time.LocalTime;
 
public record VideoAulaResponseDTO(
    Integer id,
    String titulo,
    LocalTime duracao,
    String url,
    boolean assistida   // preenchido com base no ProgressoAula do aluno logado
) {}
 
