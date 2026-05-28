package com.aprenda.cursos_aprenda.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.aprenda.cursos_aprenda.dtos.request.AdministradorRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AdministradorResponseDTO;
import com.aprenda.cursos_aprenda.services.AdministradorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/administradores")
@RequiredArgsConstructor
public class AdministradorController {

    private final AdministradorService adminService;

    @PostMapping
    public ResponseEntity<AdministradorResponseDTO> cadastrar(@Valid @RequestBody AdministradorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.cadastrar(dto));
    }
}