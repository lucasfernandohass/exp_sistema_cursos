package com.aprenda.cursos_aprenda.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aprenda.cursos_aprenda.models.Administrador;
 
@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Integer> {
    Optional<Administrador> findByEmail(String email);
    boolean existsByEmail(String email);
}
 