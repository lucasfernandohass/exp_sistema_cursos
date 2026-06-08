package com.aprenda.cursos_aprenda.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "matricula")
public class Matricula {

    @EmbeddedId
    private MatriculaId id = new MatriculaId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("alunoId")
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cursoId")
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "media_final", precision = 4, scale = 2)
    private BigDecimal mediaFinal;

    @Column(name = "avaliacao")
    private Integer avaliacao; // nota 1-5 dada pelo aluno

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidade_pagamento", nullable = false)
    private ModalidadePagamento modalidadePagamento = ModalidadePagamento.AVISTA;

    @Column(name = "numero_parcelas", nullable = false)
    private Integer numeroParcelas = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_pagamento", nullable = false)
    private StatusPagamento statusPagamento = StatusPagamento.PENDENTE;

    @Column(name = "data_matricula", nullable = false)
    private LocalDateTime dataMatricula = LocalDateTime.now();

    public enum ModalidadePagamento { AVISTA, PARCELADO }
    public enum StatusPagamento     { PENDENTE, PAGO, CANCELADO }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class MatriculaId implements java.io.Serializable {

        @Column(name = "aluno_id")
        private Integer alunoId;

        @Column(name = "curso_id")
        private Integer cursoId;
    }
}