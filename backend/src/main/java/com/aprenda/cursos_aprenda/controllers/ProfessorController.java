package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.ProfessorRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.ProfessorResponseDTO;
import com.aprenda.cursos_aprenda.services.ProfessorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/professores")
@RequiredArgsConstructor
public class ProfessorController {
 
    private final ProfessorService professorService;
 
    @GetMapping
    public ResponseEntity<List<ProfessorResponseDTO>> listar() {
        return ResponseEntity.ok(professorService.listarTodos());
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<ProfessorResponseDTO> buscar(@PathVariable Integer id) {
        return ResponseEntity.ok(professorService.buscarPorId(id));
    }
 
    @PostMapping
    public ResponseEntity<ProfessorResponseDTO> cadastrar(@Valid @RequestBody ProfessorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(professorService.cadastrar(dto));
    }
 
    @PutMapping("/{id}")
    public ResponseEntity<ProfessorResponseDTO> atualizar(@PathVariable Integer id, @Valid @RequestBody ProfessorRequestDTO dto) {
        return ResponseEntity.ok(professorService.atualizar(id, dto));
    }
 
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        professorService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
