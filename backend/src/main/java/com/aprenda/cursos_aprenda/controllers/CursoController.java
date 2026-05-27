package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.CursoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.CursoCardDTO;
import com.aprenda.cursos_aprenda.dtos.response.CursoDetalheDTO;
import com.aprenda.cursos_aprenda.services.CursoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/cursos")
@RequiredArgsConstructor
public class CursoController {
 
    private final CursoService cursoService;
 
    @GetMapping
    public ResponseEntity<List<CursoCardDTO>> listar() {
        return ResponseEntity.ok(cursoService.listarTodos());
    }
 
    @GetMapping("/pesquisar")
    public ResponseEntity<List<CursoCardDTO>> pesquisar(@RequestParam String termo) {
        return ResponseEntity.ok(cursoService.pesquisar(termo));
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<CursoDetalheDTO> buscar(@PathVariable Integer id) {
        return ResponseEntity.ok(cursoService.buscarPorId(id));
    }
 
    @PostMapping
    public ResponseEntity<CursoDetalheDTO> criar(@Valid @RequestBody CursoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoService.criar(dto));
    }
 
    @PutMapping("/{id}")
    public ResponseEntity<CursoDetalheDTO> atualizar(@PathVariable Integer id, @Valid @RequestBody CursoRequestDTO dto) {
        return ResponseEntity.ok(cursoService.atualizar(id, dto));
    }
 
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        cursoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}