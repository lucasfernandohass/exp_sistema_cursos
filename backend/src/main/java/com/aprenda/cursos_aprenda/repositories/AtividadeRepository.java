package com.aprenda.cursos_aprenda.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aprenda.cursos_aprenda.models.Atividade;
 
@Repository
public interface AtividadeRepository extends JpaRepository<Atividade, Integer> {
    List<Atividade> findByVideoAulaId(Integer videoAulaId);
}
