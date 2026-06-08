package com.aprenda.cursos_aprenda.dtos.response;

import java.math.BigDecimal;

public record AvaliacaoResponseDTO(
    Integer cursoId,
    String nomeCurso,
    Integer nota,
    BigDecimal novaMedia,
    Integer totalAvaliacoes
) {}