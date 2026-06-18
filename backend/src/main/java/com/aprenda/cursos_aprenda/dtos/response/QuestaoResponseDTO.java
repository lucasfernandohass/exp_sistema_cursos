package com.aprenda.cursos_aprenda.dtos.response;

import java.util.List;

public record QuestaoResponseDTO(
    Integer id,
    String enunciado,
    Integer ordem,
    List<AlternativaResponseDTO> alternativas
) {}