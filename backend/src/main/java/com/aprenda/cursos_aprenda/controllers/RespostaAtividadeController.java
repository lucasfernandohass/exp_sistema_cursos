package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.RespostaAtividadeRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.RespostaAtividadeResponseDTO;
import com.aprenda.cursos_aprenda.services.RespostaAtividadeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/respostas")
@RequiredArgsConstructor
public class RespostaAtividadeController {
 
    private final RespostaAtividadeService respostaAtividadeService;
 
    @GetMapping("/atividade/{atividadeId}")
    public ResponseEntity<List<RespostaAtividadeResponseDTO>> listarPorAtividade(@PathVariable Integer atividadeId) {
        return ResponseEntity.ok(respostaAtividadeService.listarPorAtividade(atividadeId));
    }
 
    @PostMapping
    public ResponseEntity<RespostaAtividadeResponseDTO> responder(@Valid @RequestBody RespostaAtividadeRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(respostaAtividadeService.responder(dto));
    }
 
    @PatchMapping("/{id}/nota")
    public ResponseEntity<RespostaAtividadeResponseDTO> corrigir(@PathVariable Integer id, @RequestParam Double nota) {
        return ResponseEntity.ok(respostaAtividadeService.corrigir(id, nota));
    }
}