package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AlternativaRequestDTO(
    @NotBlank(message = "Texto da alternativa é obrigatório")
    String texto,

    @NotNull(message = "Ordem é obrigatória")
    Integer ordem,

    @NotNull(message = "Indicador de correta é obrigatório")
    Boolean correta
) {}