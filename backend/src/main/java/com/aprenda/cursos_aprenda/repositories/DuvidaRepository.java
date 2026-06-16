package com.aprenda.cursos_aprenda.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aprenda.cursos_aprenda.models.Duvida;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
@Repository
public interface DuvidaRepository extends JpaRepository<Duvida, Integer> {
    
    List<Duvida> findByVideoAulaId(Integer videoAulaId);
    
    List<Duvida> findByAlunoId(Integer alunoId);
    
    @Query("SELECT d FROM Duvida d WHERE d.videoAula.curso.id IN :cursoIds")
    List<Duvida> findByVideoAulaCursoIdIn(@Param("cursoIds") List<Integer> cursoIds);
   
    @Query("SELECT d FROM Duvida d WHERE d.videoAula.curso.id IN :cursoIds AND d.resposta IS NULL")
    List<Duvida> findByVideoAulaCursoIdInAndRespostaIsNull(@Param("cursoIds") List<Integer> cursoIds);
    
    List<Duvida> findByProfessorIdAndRespostaIsNull(Integer professorId);
    
    List<Duvida> findByRespostaIsNull();
}