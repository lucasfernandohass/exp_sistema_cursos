package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.VideoAulaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.VideoAulaResponseDTO;
import com.aprenda.cursos_aprenda.services.VideoAulaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/video-aulas")
@RequiredArgsConstructor
public class VideoAulaController {

    private final VideoAulaService videoAulaService;

    // Listar aulas de um curso
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('PROFESSOR')")
    public ResponseEntity<List<VideoAulaResponseDTO>> listarPorCurso(
            @RequestParam Integer cursoId) {
        return ResponseEntity.ok(videoAulaService.listarPorCurso(cursoId));
    }

    // Buscar uma aula específica
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('PROFESSOR')")
    public ResponseEntity<VideoAulaResponseDTO> buscar(@PathVariable Integer id) {
        return ResponseEntity.ok(videoAulaService.buscarPorId(id));
    }

    // Criar nova aula
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<VideoAulaResponseDTO> criar(@Valid @RequestBody VideoAulaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(videoAulaService.criar(dto));
    }

    // Atualizar aula
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<VideoAulaResponseDTO> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody VideoAulaRequestDTO dto) {
        return ResponseEntity.ok(videoAulaService.atualizar(id, dto));
    }

    // Deletar aula
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        videoAulaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}