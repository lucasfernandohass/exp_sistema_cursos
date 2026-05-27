package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
 
public record DuvidaRequestDTO(
    @NotBlank(message = "Pergunta é obrigatória")
    String pergunta,
 
    @NotNull(message = "VideoAula é obrigatória")
    Integer videoAulaId
) {}