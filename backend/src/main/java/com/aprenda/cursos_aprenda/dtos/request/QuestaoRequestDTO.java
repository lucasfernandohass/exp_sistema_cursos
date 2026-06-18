package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record QuestaoRequestDTO(
    @NotBlank(message = "Enunciado é obrigatório")
    String enunciado,

    @NotNull(message = "Ordem é obrigatória")
    Integer ordem,

    @Size(min = 4, max = 4, message = "Deve ter exatamente 4 alternativas")
    List<AlternativaRequestDTO> alternativas
) {}