package com.aprenda.cursos_aprenda.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aprenda.cursos_aprenda.models.Certificado;
 
@Repository
public interface CertificadoRepository extends JpaRepository<Certificado, Integer> {
    List<Certificado> findByAlunoId(Integer alunoId);
    Optional<Certificado> findByCodigoValidacao(String codigoValidacao);
    boolean existsByAlunoIdAndCursoId(Integer alunoId, Integer cursoId);
}
