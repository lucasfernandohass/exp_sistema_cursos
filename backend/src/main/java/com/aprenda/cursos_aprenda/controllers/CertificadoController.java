package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.response.CertificadoResponseDTO;
import com.aprenda.cursos_aprenda.models.Certificado;
import com.aprenda.cursos_aprenda.services.CertificadoService;
import com.aprenda.cursos_aprenda.repositories.CertificadoRepository;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
 
import java.util.List;
 
@RestController
@RequestMapping("/certificados")
@RequiredArgsConstructor
public class CertificadoController {
 
    private final CertificadoService certificadoService;
    private final CertificadoRepository certificadoRepository;
 
    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<CertificadoResponseDTO>> listarPorAluno(@PathVariable Integer alunoId) {
        List<CertificadoResponseDTO> lista = certificadoService.listarPorAluno(alunoId);
        return ResponseEntity.ok(certificadoService.listarPorAluno(alunoId));
    }
 
    @GetMapping("/validar/{codigo}")
    public ResponseEntity<CertificadoResponseDTO> validar(@PathVariable String codigo) {
        return ResponseEntity.ok(certificadoService.validar(codigo));
    }
 
    @PostMapping("/emitir")
    public ResponseEntity<CertificadoResponseDTO> emitir(
            @RequestParam Integer alunoId,
            @RequestParam Integer cursoId) {
        CertificadoResponseDTO dto = certificadoService.emitir(alunoId, cursoId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/download/{codigo}")
    public ResponseEntity<byte[]> download(@PathVariable String codigo) {
        Certificado certificado = certificadoRepository.findByCodigoValidacao(codigo)
            .orElseThrow(() -> new EntityNotFoundException("Certificado não encontrado"));

        byte[] pdf = certificado.getConteudoPdf();
        if (pdf == null) {
            throw new RuntimeException("PDF não disponível para este certificado");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "certificado_" + codigo + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }


}