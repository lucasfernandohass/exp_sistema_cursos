package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.response.ProgressoAulaResponseDTO;
import com.aprenda.cursos_aprenda.services.ProgressoAulaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/progresso")
@RequiredArgsConstructor
public class ProgressoAulaController {

    private final ProgressoAulaService progressoAulaService;

    @PostMapping("/aluno/{alunoId}/video-aula/{videoAulaId}")
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<ProgressoAulaResponseDTO> marcarAssistida(
            @PathVariable Integer alunoId,
            @PathVariable Integer videoAulaId) {
        
        ProgressoAulaResponseDTO progresso = progressoAulaService.marcarAssistida(alunoId, videoAulaId);
        return ResponseEntity.ok(progresso);
    }

    @GetMapping("/aluno/{alunoId}/curso/{cursoId}/completo")
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<Boolean> isCursoCompleto(
            @PathVariable Integer alunoId,
            @PathVariable Integer cursoId) {
        
        boolean completo = progressoAulaService.isCursoCompleto(alunoId, cursoId);
        return ResponseEntity.ok(completo);
    }
}