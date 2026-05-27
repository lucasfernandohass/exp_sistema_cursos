package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
 
public record DuvidaRespostaRequestDTO(
    @NotBlank(message = "Resposta é obrigatória")
    String resposta
) {}