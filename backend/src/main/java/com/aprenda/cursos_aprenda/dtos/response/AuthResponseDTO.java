package com.aprenda.cursos_aprenda.dtos.response;

public record AuthResponseDTO(
    String token,
    String tipo,     // "ALUNO", "PROFESSOR", "ADMINISTRADOR"
    Integer id,
    String nome,
    String email
) {}