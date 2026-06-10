package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.NotBlank;

public record PagamentoRequestDTO(
    @NotBlank(message = "Forma de pagamento e obrigatoria")
    String formaPagamento
) {}
