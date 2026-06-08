package com.aprenda.cursos_aprenda.models;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "curso")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Column(length = 5000)
    private String ementa;

    @Column(name = "carga_horaria")
    private Integer cargaHoraria;

    @Column(name = "numero_aulas")
    private Integer numeroAulas;

    @Column(precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(precision = 4, scale = 2)
    private BigDecimal media;

    @Column(name = "nota_avaliacao", precision = 4, scale = 2)
    private BigDecimal notaAvaliacao;

    @Column(name = "numero_avaliacoes")
    private Integer numeroAvaliacoes;

    @Column(name = "url_banner", nullable = false, length = 255)    
    private String urlBanner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id")
    private Professor professor;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VideoAula> videoAulas = new ArrayList<>();

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Matricula> matriculas = new ArrayList<>();
}