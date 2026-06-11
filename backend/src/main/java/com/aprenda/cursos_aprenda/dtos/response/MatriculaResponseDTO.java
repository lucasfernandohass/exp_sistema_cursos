package com.aprenda.cursos_aprenda.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
 
// Dashboard do aluno — agrega dados de Matricula + Curso + Progresso
public record MatriculaResponseDTO(
    Integer cursoId,
    String nomeCurso,
    String nomeProfessor,
    String urlBanner,
    Integer totalAulas,
    Integer aulasConcluidas,
    BigDecimal mediaFinal,
    String modalidadePagamento,
    Integer numeroParcelas,
    String statusPagamento,
    LocalDateTime dataMatricula,
    String tipoCobranca,
    String codigoCobranca,
    String linkPagamento,
    LocalDateTime dataCobranca,
    LocalDateTime dataPagamento,
    boolean certificadoDisponivel
) {}
