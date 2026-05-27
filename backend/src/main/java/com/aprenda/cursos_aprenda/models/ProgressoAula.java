package com.aprenda.cursos_aprenda.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "progresso_aula")
public class ProgressoAula {

    @EmbeddedId
    private ProgressoAulaId id = new ProgressoAulaId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("alunoId")
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("videoAulaId")
    @JoinColumn(name = "video_aula_id", nullable = false)
    private VideoAula videoAula;

    @Column(nullable = false)
    private Boolean assistida = false;

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressoAulaId implements java.io.Serializable {

        @Column(name = "aluno_id")
        private Integer alunoId;

        @Column(name = "video_aula_id")
        private Integer videoAulaId;
    }
}