package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RespostaQuestaoRequestDTO(
    @NotNull(message = "Atividade é obrigatória")
    Integer atividadeId,
    
    @NotNull(message = "Respostas são obrigatórias")
    List<RespostaItemDTO> respostas
) {}