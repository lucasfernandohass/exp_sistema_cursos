package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
import java.time.LocalTime;
 
public record VideoAulaRequestDTO(
    @NotBlank(message = "Título é obrigatório")
    String titulo,
 
    LocalTime duracao,
 
    @NotBlank(message = "URL é obrigatória")
    String url,
 
    @NotNull(message = "Curso é obrigatório")
    Integer cursoId
) {}
 