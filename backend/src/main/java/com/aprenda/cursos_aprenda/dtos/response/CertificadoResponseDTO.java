package com.aprenda.cursos_aprenda.dtos.response;

import java.time.LocalDateTime;
 
public record CertificadoResponseDTO(
    Integer id,
    Integer cursoId,
    String nomeAluno,
    String nomeCurso,
    String nomeProfessor,
    LocalDateTime dataEmissao,
    String codigoValidacao
) {}