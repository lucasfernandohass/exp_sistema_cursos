package com.aprenda.cursos_aprenda.models;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
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
@Table(name = "video_aula")
public class VideoAula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String titulo;

    private LocalTime duracao;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @OneToMany(mappedBy = "videoAula", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Duvida> duvidas = new ArrayList<>();

    @OneToMany(mappedBy = "videoAula", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProgressoAula> progressos = new ArrayList<>();
}