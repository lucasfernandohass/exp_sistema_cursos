package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.AlunoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.AlunoUpdateRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.RespostaQuestaoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AlunoResponseDTO;
import com.aprenda.cursos_aprenda.services.AlunoService;
import com.aprenda.cursos_aprenda.services.AtividadeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alunos")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService alunoService;
    private final AtividadeService atividadeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<AlunoResponseDTO>> listar() {
        return ResponseEntity.ok(alunoService.listarTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ALUNO')")
    public ResponseEntity<AlunoResponseDTO> buscar(@PathVariable Integer id) {
        // Verificação manual no service
        return ResponseEntity.ok(alunoService.buscarPorId(id, true));
    }

    @PostMapping
    public ResponseEntity<AlunoResponseDTO> cadastrar(@Valid @RequestBody AlunoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoService.cadastrar(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ALUNO')")
    public ResponseEntity<AlunoResponseDTO> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AlunoUpdateRequestDTO dto) {
        return ResponseEntity.ok(alunoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        alunoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{alunoId}/atividades/{atividadeId}/responder")
    @PreAuthorize("@alunoService.isAlunoLogado(#alunoId)")
    public ResponseEntity<Map<String, Object>> responderAtividade(
            @PathVariable Integer alunoId,
            @PathVariable Integer atividadeId,
            @Valid @RequestBody RespostaQuestaoRequestDTO dto) {
        
        Map<String, Object> resultado = atividadeService.responderAtividade(
            alunoId, 
            atividadeId, 
            dto.respostas()
        );
        
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{alunoId}/atividades/{atividadeId}/status")
    @PreAuthorize("@alunoService.isAlunoLogado(#alunoId)")
    public ResponseEntity<Map<String, Object>> getStatusAtividade(
            @PathVariable Integer alunoId,
            @PathVariable Integer atividadeId) {
        
        Map<String, Object> status = atividadeService.getStatusAtividade(alunoId, atividadeId);
        return ResponseEntity.ok(status);
    }


    @GetMapping("/{alunoId}/atividades/{atividadeId}/respostas")
    @PreAuthorize("@alunoService.isAlunoLogado(#alunoId)")
    public ResponseEntity<?> getRespostasAluno(
            @PathVariable Integer alunoId,
            @PathVariable Integer atividadeId) {
        try {
            List<Map<String, Object>> respostas = atividadeService.getRespostasAluno(alunoId, atividadeId);
            return ResponseEntity.ok(respostas);
        } catch (Exception e) {
            System.err.println("❌ Erro ao buscar respostas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/{alunoId}/cursos/{cursoId}/atividades/progresso")
    @PreAuthorize("@alunoService.isAlunoLogado(#alunoId)")
    public ResponseEntity<Map<String, Object>> getProgressoAtividadesCurso(
            @PathVariable Integer alunoId,
            @PathVariable Integer cursoId) {
        
        Map<String, Object> progresso = atividadeService.getProgressoAtividadesCurso(alunoId, cursoId);
        return ResponseEntity.ok(progresso);
    }

}