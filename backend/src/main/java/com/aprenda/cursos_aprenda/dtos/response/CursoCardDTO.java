package com.aprenda.cursos_aprenda.dtos.response;

import java.math.BigDecimal;
 
// Usado na home e listagens — versão resumida
public record CursoCardDTO(
    Integer id,
    String nome,
    String descricao,
    String ementa,
    String nomeProfessor,
    Integer numeroAulas,
    Integer cargaHoraria,
    BigDecimal preco,
    BigDecimal media,
    BigDecimal notaAvaliacao,
    String urlBanner
    
) {}
 