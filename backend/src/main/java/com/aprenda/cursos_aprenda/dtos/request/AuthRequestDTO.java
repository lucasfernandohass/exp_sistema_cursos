package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
 
public record AuthRequestDTO(
    @Email(message = "Email inválido")
    @NotBlank(message = "Email é obrigatório")
    String email,
 
    @NotBlank(message = "Senha é obrigatória")
    String senha
) {}