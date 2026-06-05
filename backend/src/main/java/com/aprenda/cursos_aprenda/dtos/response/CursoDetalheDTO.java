package com.aprenda.cursos_aprenda.dtos.response;

import java.math.BigDecimal;
import java.util.List;
 
// Usado na página individual do curso — versão completa
public record CursoDetalheDTO(
    Integer id,
    String nome,
    String descricao,
    String ementa,
    Integer cargaHoraria,
    Integer numeroAulas,
    BigDecimal preco,
    BigDecimal media,
    BigDecimal notaAvaliacao,
    String urlBanner,
    ProfessorResponseDTO professor,
    List<VideoAulaResponseDTO> videoAulas
) {}
 