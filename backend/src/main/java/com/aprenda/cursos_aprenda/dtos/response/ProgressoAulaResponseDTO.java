package com.aprenda.cursos_aprenda.dtos.response;

import java.time.LocalDateTime;

public record ProgressoAulaResponseDTO(
    Integer alunoId,
    Integer videoAulaId,
    Boolean assistida,
    LocalDateTime dataConclusao
) {}