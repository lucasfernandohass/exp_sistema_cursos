package com.aprenda.cursos_aprenda.dtos.response;

import java.time.LocalDateTime;
 
public record DuvidaResponseDTO(
    Integer id,
    String pergunta,
    String resposta,
    LocalDateTime dataEnvio,
    LocalDateTime dataResposta,
    String nomeAluno,
    String nomeProfessor,   // null enquanto não respondida
    Integer videoAulaId,
    String tituloVideoAula
) {}