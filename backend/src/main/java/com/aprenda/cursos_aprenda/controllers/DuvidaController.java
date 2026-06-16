package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.DuvidaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.DuvidaRespostaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.DuvidaResponseDTO;
import com.aprenda.cursos_aprenda.services.DuvidaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/duvidas")
@RequiredArgsConstructor
public class DuvidaController {
 
    private final DuvidaService duvidaService;
 
    @GetMapping("/video-aula/{videoAulaId}")
    @PreAuthorize("hasAnyRole('ALUNO', 'PROFESSOR')")
    public ResponseEntity<List<DuvidaResponseDTO>> listarPorVideoAula(@PathVariable Integer videoAulaId) {
        return ResponseEntity.ok(duvidaService.listarPorVideoAula(videoAulaId));
    }
 
    @GetMapping("/professor/{professorId}/pendentes")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<List<DuvidaResponseDTO>> listarPendentes(@PathVariable Integer professorId) {
        return ResponseEntity.ok(duvidaService.listarPendentes(professorId));
    }

    @PostMapping("/aluno/{alunoId}")
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<DuvidaResponseDTO> enviar(
            @PathVariable Integer alunoId,
            @Valid @RequestBody DuvidaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(duvidaService.enviar(alunoId, dto));
    }

    @PatchMapping("/{duvidaId}/responder")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<DuvidaResponseDTO> responder(
            @PathVariable Integer duvidaId,
            @Valid @RequestBody DuvidaRespostaRequestDTO dto) {
        return ResponseEntity.ok(duvidaService.responder(duvidaId, dto));
    }

    @GetMapping("/professor/{professorId}/todas")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<List<DuvidaResponseDTO>> listarTodas(@PathVariable Integer professorId) {
        return ResponseEntity.ok(duvidaService.listarTodas(professorId));
    }
}