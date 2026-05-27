package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
 
public record CursoRequestDTO(
    @NotBlank(message = "Nome é obrigatório")
    String nome,
 
    String ementa,
 
    Integer cargaHoraria,
 
    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.0", message = "Preço não pode ser negativo")
    BigDecimal preco,
 
    @NotNull(message = "Professor é obrigatório")
    Integer professorId
) {}