package com.aprenda.cursos_aprenda.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "resposta_atividade_questoes")
public class RespostaAtividadeQuestoes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atividade_id", nullable = false)
    private Atividade atividade;

    @Column(name = "nota", precision = 4, scale = 2)
    private BigDecimal nota;

    @Column(name = "questoes_corretas", nullable = false)
    private Integer questoesCorretas = 0;

    @Column(name = "total_questoes", nullable = false)
    private Integer totalQuestoes = 0;

    @Column(name = "data_entrega", nullable = false)
    private LocalDateTime dataEntrega = LocalDateTime.now();
}