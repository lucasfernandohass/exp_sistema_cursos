package com.aprenda.cursos_aprenda.dtos.response;

public record AlternativaResponseDTO(
    Integer id,
    String texto,
    Integer ordem,
    Boolean correta
) {}