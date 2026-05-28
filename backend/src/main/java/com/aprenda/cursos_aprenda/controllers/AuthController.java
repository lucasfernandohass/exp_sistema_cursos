package com.aprenda.cursos_aprenda.controllers;

import com.aprenda.cursos_aprenda.dtos.request.AdministradorRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.AuthRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AdministradorResponseDTO;
import com.aprenda.cursos_aprenda.dtos.response.AuthResponseDTO;
import com.aprenda.cursos_aprenda.services.AuthService;
import com.aprenda.cursos_aprenda.services.AdministradorService;
import com.aprenda.cursos_aprenda.repositories.AdministradorRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
 
    private final AdministradorRepository adminRepository;
    private final AdministradorService adminService;
    private final AuthService authService;
 
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    //PERMITIR CRIAR O PRIMEIRO ADMIN SEM TER PERMISSAO DE ADMINISTRADOR, PARA O SETUP INICIAL DO SISTEMA
    @PostMapping("/setup")
    public ResponseEntity<AdministradorResponseDTO> setup(@Valid @RequestBody AdministradorRequestDTO dto) {
        if (adminRepository.count() > 0)
            throw new IllegalArgumentException("Setup já realizado");
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.cadastrar(dto));
    }

}