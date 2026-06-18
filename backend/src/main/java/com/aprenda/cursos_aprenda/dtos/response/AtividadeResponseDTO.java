package com.aprenda.cursos_aprenda.dtos.response;

import java.util.List;

public record AtividadeResponseDTO(
    Integer id,
    String titulo,
    String descricao,
    Integer cursoId,
    String nomeCurso,
    List<QuestaoResponseDTO> questoes
) {}