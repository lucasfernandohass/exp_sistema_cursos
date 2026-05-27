package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.DuvidaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.DuvidaRespostaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.DuvidaResponseDTO;
import com.aprenda.cursos_aprenda.services.DuvidaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/duvidas")
@RequiredArgsConstructor
public class DuvidaController {
 
    private final DuvidaService duvidaService;
 
    @GetMapping("/video-aula/{videoAulaId}")
    public ResponseEntity<List<DuvidaResponseDTO>> listarPorVideoAula(@PathVariable Integer videoAulaId) {
        return ResponseEntity.ok(duvidaService.listarPorVideoAula(videoAulaId));
    }
 
    @GetMapping("/professor/{professorId}/pendentes")
    public ResponseEntity<List<DuvidaResponseDTO>> listarPendentes(@PathVariable Integer professorId) {
        return ResponseEntity.ok(duvidaService.listarPendentes(professorId));
    }
 
    @PostMapping
    public ResponseEntity<DuvidaResponseDTO> enviar(@Valid @RequestBody DuvidaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(duvidaService.enviar(dto));
    }
 
    @PatchMapping("/{id}/responder")
    public ResponseEntity<DuvidaResponseDTO> responder(@PathVariable Integer id, @Valid @RequestBody DuvidaRespostaRequestDTO dto) {
        return ResponseEntity.ok(duvidaService.responder(id, dto));
    }
}
