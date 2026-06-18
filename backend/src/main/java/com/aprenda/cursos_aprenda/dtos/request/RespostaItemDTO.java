package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.NotNull;

public record RespostaItemDTO(
    @NotNull(message = "Questão é obrigatória")
    Integer questaoId,
    
    @NotNull(message = "Alternativa é obrigatória")
    Integer alternativaIndex
) {}