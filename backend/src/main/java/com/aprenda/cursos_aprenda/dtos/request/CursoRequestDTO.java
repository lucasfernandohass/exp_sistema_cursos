package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
 
public record CursoRequestDTO(
    @NotBlank(message = "Nome é obrigatório")
    String nome,

    @NotBlank(message = "Descrição é obrigatória")
    String descricao,

    String ementa,

    @NotNull(message = "Carga horária é obrigatória")
    Integer cargaHoraria,

    Integer numeroAulas,

    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.0", message = "Preço não pode ser negativo")
    BigDecimal preco,

    @DecimalMin(value = "0.0", message = "Média não pode ser negativa")
    @DecimalMax(value = "10.0", message = "Média não pode ser maior que 10")
    BigDecimal media,

    @NotBlank(message = "URL do banner é obrigatória")
    String urlBanner,

    Integer professorId
) {}