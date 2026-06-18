package com.aprenda.cursos_aprenda.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
 
public record AlunoUpdateRequestDTO(

    @Email(message = "Email inválido")
    String email,

    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    String senha,
 
    String telefone,
    LocalDate dataNascimento
) {}