package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
 
public record RespostaAtividadeRequestDTO(
    @NotBlank(message = "Resposta é obrigatória")
    String resposta,
 
    @NotNull(message = "Atividade é obrigatória")
    Integer atividadeId
) {}
 