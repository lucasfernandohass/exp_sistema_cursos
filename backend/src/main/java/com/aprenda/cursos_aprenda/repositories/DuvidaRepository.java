package com.aprenda.cursos_aprenda.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aprenda.cursos_aprenda.models.Duvida;
 
@Repository
public interface DuvidaRepository extends JpaRepository<Duvida, Integer> {
    List<Duvida> findByVideoAulaId(Integer videoAulaId);
    List<Duvida> findByAlunoId(Integer alunoId);
    List<Duvida> findByProfessorIdAndRespostaIsNull(Integer professorId);
    List<Duvida> findByRespostaIsNull();
}
