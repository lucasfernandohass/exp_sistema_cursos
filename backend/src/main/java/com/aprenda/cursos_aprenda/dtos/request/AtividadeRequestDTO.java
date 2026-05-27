package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
 
public record AtividadeRequestDTO(
    @NotBlank(message = "Título é obrigatório")
    String titulo,
 
    String descricao,
 
    @NotNull(message = "VideoAula é obrigatória")
    Integer videoAulaId
) {}
 