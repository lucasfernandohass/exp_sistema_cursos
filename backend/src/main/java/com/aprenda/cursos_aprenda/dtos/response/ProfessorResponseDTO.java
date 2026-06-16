package com.aprenda.cursos_aprenda.dtos.response;

public record ProfessorResponseDTO(
    Integer id,
    String nome,
    String email,
    String formacao,
    String telefone,
    String cpf
) {}
 