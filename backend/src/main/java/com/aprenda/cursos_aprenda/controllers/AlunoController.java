package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.AlunoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AlunoResponseDTO;
import com.aprenda.cursos_aprenda.services.AlunoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/alunos")
@RequiredArgsConstructor
public class AlunoController {
 
    private final AlunoService alunoService;
 
    @GetMapping
    public ResponseEntity<List<AlunoResponseDTO>> listar() {
        return ResponseEntity.ok(alunoService.listarTodos());
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<AlunoResponseDTO> buscar(@PathVariable Integer id) {
        return ResponseEntity.ok(alunoService.buscarPorId(id));
    }
 
    @PostMapping
    public ResponseEntity<AlunoResponseDTO> cadastrar(@Valid @RequestBody AlunoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoService.cadastrar(dto));
    }
 
    @PutMapping("/{id}")
    public ResponseEntity<AlunoResponseDTO> atualizar(@PathVariable Integer id, @Valid @RequestBody AlunoRequestDTO dto) {
        return ResponseEntity.ok(alunoService.atualizar(id, dto));
    }
 
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        alunoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}