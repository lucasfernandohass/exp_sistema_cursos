package com.aprenda.cursos_aprenda.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aprenda.cursos_aprenda.models.Aluno;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Integer> {
    Optional<Aluno> findByEmail(String email);
    Optional<Aluno> findByCpf(String cpf);
    Optional<Aluno> findByRa(String ra);
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
    Optional<Aluno> findByEmailIgnoreCase(String email);
}