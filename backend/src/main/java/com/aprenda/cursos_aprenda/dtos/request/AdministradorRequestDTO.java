package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
 
public record AdministradorRequestDTO(
    @Email(message = "Email inválido")
    @NotBlank(message = "Email é obrigatório")
    String email,
 
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    String senha,
 
    Integer nivelAcesso
) {}
