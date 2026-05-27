package com.aprenda.cursos_aprenda.dtos.response;

import java.time.LocalDate;
 
public record AlunoResponseDTO(
    Integer id,
    String nome,
    String email,
    String ra,
    String telefone,
    LocalDate dataNascimento
) {}
 