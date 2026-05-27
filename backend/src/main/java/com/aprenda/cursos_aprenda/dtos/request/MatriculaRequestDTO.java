package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
 
public record MatriculaRequestDTO(
    @NotNull(message = "Curso é obrigatório")
    Integer cursoId,
 
    @NotNull(message = "Modalidade de pagamento é obrigatória")
    String modalidadePagamento,
 
    Integer numeroParcelas
) {}