package com.aprenda.cursos_aprenda.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.aprenda.cursos_aprenda.models.Curso;
 
@Repository
public interface CursoRepository extends JpaRepository<Curso, Integer> {
 
    // Busca por nome (pesquisa parcial)
    List<Curso> findByNomeContainingIgnoreCase(String nome);
 
    // Busca fulltext
    @Query(value = "SELECT * FROM curso WHERE MATCH(nome, ementa) AGAINST (:termo IN BOOLEAN MODE)", nativeQuery = true)
    List<Curso> searchByTexto(@Param("termo") String termo);
 
    // Cursos de um professor específico
    List<Curso> findByProfessorId(Integer professorId);
}