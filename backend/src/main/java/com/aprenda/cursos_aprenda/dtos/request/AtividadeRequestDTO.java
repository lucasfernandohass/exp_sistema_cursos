package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AtividadeRequestDTO(
    @NotBlank(message = "Título é obrigatório")
    String titulo,

    String descricao,

    @NotNull(message = "Curso é obrigatório")
    Integer cursoId,

    @Size(min = 1, max = 10, message = "Deve ter entre 1 e 10 questões")
    List<QuestaoRequestDTO> questoes
) {}