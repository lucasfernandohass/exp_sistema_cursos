package com.aprenda.cursos_aprenda.dtos.response;

import java.math.BigDecimal;
import java.util.List;
 
// Usado na página individual do curso — versão completa
public record CursoDetalheDTO(
    Integer id,
    String nome,
    String ementa,
    Integer cargaHoraria,
    Integer numeroAulas,
    BigDecimal preco,
    BigDecimal notaAvaliacao,
    ProfessorResponseDTO professor,
    List<VideoAulaResponseDTO> videoAulas
) {}
 