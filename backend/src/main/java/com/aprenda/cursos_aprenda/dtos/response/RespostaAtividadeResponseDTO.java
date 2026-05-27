package com.aprenda.cursos_aprenda.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
 
public record RespostaAtividadeResponseDTO(
    Integer id,
    String resposta,
    BigDecimal nota,
    LocalDateTime dataEntrega,
    String nomeAluno,
    String tituloAtividade
) {}