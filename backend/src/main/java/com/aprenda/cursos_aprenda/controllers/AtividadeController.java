package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.AtividadeRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AtividadeResponseDTO;
import com.aprenda.cursos_aprenda.services.AtividadeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/atividades")
@RequiredArgsConstructor
public class AtividadeController {

    private final AtividadeService atividadeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('PROFESSOR') or hasRole('ALUNO')")
    public ResponseEntity<List<AtividadeResponseDTO>> listarPorCurso(
            @RequestParam Integer cursoId) {
        return ResponseEntity.ok(atividadeService.listarPorCurso(cursoId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('PROFESSOR') or hasRole('ALUNO')")
    public ResponseEntity<AtividadeResponseDTO> buscar(@PathVariable Integer id) {
        return ResponseEntity.ok(atividadeService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<AtividadeResponseDTO> criar(@Valid @RequestBody AtividadeRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(atividadeService.criar(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<AtividadeResponseDTO> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtividadeRequestDTO dto) {
        return ResponseEntity.ok(atividadeService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        atividadeService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}