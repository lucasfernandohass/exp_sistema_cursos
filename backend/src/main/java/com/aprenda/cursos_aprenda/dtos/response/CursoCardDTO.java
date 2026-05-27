package com.aprenda.cursos_aprenda.dtos.response;

import java.math.BigDecimal;
 
// Usado na home e listagens — versão resumida
public record CursoCardDTO(
    Integer id,
    String nome,
    String nomeProfessor,
    Integer numeroAulas,
    Integer cargaHoraria,
    BigDecimal preco,
    BigDecimal notaAvaliacao
) {}
 