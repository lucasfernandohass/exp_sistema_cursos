package com.aprenda.cursos_aprenda.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aprenda.cursos_aprenda.models.Matricula;
import com.aprenda.cursos_aprenda.models.Matricula.MatriculaId;
 
@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, MatriculaId> {
    List<Matricula> findByAlunoId(Integer alunoId);
    List<Matricula> findByCursoId(Integer cursoId);
    Optional<Matricula> findByAlunoIdAndCursoId(Integer alunoId, Integer cursoId);
    boolean existsByAlunoIdAndCursoId(Integer alunoId, Integer cursoId);
}