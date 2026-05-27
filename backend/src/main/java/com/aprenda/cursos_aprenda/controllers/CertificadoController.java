package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.response.CertificadoResponseDTO;
import com.aprenda.cursos_aprenda.services.CertificadoService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/certificados")
@RequiredArgsConstructor
public class CertificadoController {
 
    private final CertificadoService certificadoService;
 
    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<CertificadoResponseDTO>> listarPorAluno(@PathVariable Integer alunoId) {
        return ResponseEntity.ok(certificadoService.listarPorAluno(alunoId));
    }
 
    @GetMapping("/validar/{codigo}")
    public ResponseEntity<CertificadoResponseDTO> validar(@PathVariable String codigo) {
        return ResponseEntity.ok(certificadoService.validar(codigo));
    }
 
    @PostMapping("/aluno/{alunoId}/curso/{cursoId}")
    public ResponseEntity<CertificadoResponseDTO> emitir(@PathVariable Integer alunoId, @PathVariable Integer cursoId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(certificadoService.emitir(alunoId, cursoId));
    }
}