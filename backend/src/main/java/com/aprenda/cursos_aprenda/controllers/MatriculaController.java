package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.MatriculaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.PagamentoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.MatriculaResponseDTO;
import com.aprenda.cursos_aprenda.services.MatriculaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/matriculas")
@RequiredArgsConstructor
public class MatriculaController {
 
    private final MatriculaService matriculaService;
 
    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<MatriculaResponseDTO>> listarPorAluno(@PathVariable Integer alunoId) {
        return ResponseEntity.ok(matriculaService.listarPorAluno(alunoId));
    }
 
    @GetMapping("/aluno/{alunoId}/curso/{cursoId}")
    public ResponseEntity<MatriculaResponseDTO> buscar(@PathVariable Integer alunoId, @PathVariable Integer cursoId) {
        return ResponseEntity.ok(matriculaService.buscarPorAlunoECurso(alunoId, cursoId));
    }
 
    @PostMapping
    public ResponseEntity<MatriculaResponseDTO> matricular(@Valid @RequestBody MatriculaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matriculaService.matricular(dto));
    }
 
    @PatchMapping("/aluno/{alunoId}/curso/{cursoId}/pagamento")
    public ResponseEntity<MatriculaResponseDTO> atualizarPagamento(
            @PathVariable Integer alunoId,
            @PathVariable Integer cursoId,
            @RequestParam String status) {
        return ResponseEntity.ok(matriculaService.atualizarPagamento(alunoId, cursoId, status));
    }

    @PostMapping("/aluno/{alunoId}/curso/{cursoId}/cobranca")
    public ResponseEntity<MatriculaResponseDTO> gerarCobranca(
            @PathVariable Integer alunoId,
            @PathVariable Integer cursoId,
            @RequestParam(defaultValue = "LINK") String tipo) {
        return ResponseEntity.ok(matriculaService.gerarCobranca(alunoId, cursoId, tipo));
    }

    @PostMapping("/curso/{cursoId}/cobranca")
    public ResponseEntity<MatriculaResponseDTO> gerarCobrancaAlunoLogado(
            @PathVariable Integer cursoId,
            @RequestParam(defaultValue = "LINK") String tipo) {
        return ResponseEntity.ok(matriculaService.gerarCobrancaAlunoLogado(cursoId, tipo));
    }

    @PostMapping("/aluno/{alunoId}/curso/{cursoId}/pagamento")
    public ResponseEntity<MatriculaResponseDTO> registrarPagamento(
            @PathVariable Integer alunoId,
            @PathVariable Integer cursoId,
            @Valid @RequestBody PagamentoRequestDTO dto) {
        return ResponseEntity.ok(matriculaService.registrarPagamento(alunoId, cursoId, dto));
    }

    @PostMapping("/curso/{cursoId}/pagamento")
    public ResponseEntity<MatriculaResponseDTO> registrarPagamentoAlunoLogado(
            @PathVariable Integer cursoId,
            @Valid @RequestBody PagamentoRequestDTO dto) {
        return ResponseEntity.ok(matriculaService.registrarPagamentoAlunoLogado(cursoId, dto));
    }
 
    @DeleteMapping("/aluno/{alunoId}/curso/{cursoId}")
    public ResponseEntity<Void> cancelar(@PathVariable Integer alunoId, @PathVariable Integer cursoId) {
        matriculaService.cancelar(alunoId, cursoId);
        return ResponseEntity.noContent().build();
    }
}
