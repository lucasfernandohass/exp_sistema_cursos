package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
 
public record ProfessorRequestDTO(
    @NotBlank(message = "Nome é obrigatório")
    String nome,
 
    @Email(message = "Email inválido")
    @NotBlank(message = "Email é obrigatório")
    String email,
 
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    String senha,
 
    @NotBlank(message = "CPF é obrigatório")
    String cpf,
 
    String telefone,
    String formacao,
    LocalDate dataNascimento
) {}