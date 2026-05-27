package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.models.ProgressoAula;
import com.aprenda.cursos_aprenda.services.ProgressoAulaService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/progresso")
@RequiredArgsConstructor
public class ProgressoAulaController {
 
    private final ProgressoAulaService progressoAulaService;
 
    @PostMapping("/aluno/{alunoId}/video-aula/{videoAulaId}")
    public ResponseEntity<ProgressoAula> marcarAssistida(
            @PathVariable Integer alunoId,
            @PathVariable Integer videoAulaId) {
        return ResponseEntity.ok(progressoAulaService.marcarAssistida(alunoId, videoAulaId));
    }
 
    @GetMapping("/aluno/{alunoId}/curso/{cursoId}/completo")
    public ResponseEntity<Boolean> todasAssistidas(
            @PathVariable Integer alunoId,
            @PathVariable Integer cursoId) {
        return ResponseEntity.ok(progressoAulaService.todasAssistidas(alunoId, cursoId));
    }
}