package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.CursoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.CursoCardDTO;
import com.aprenda.cursos_aprenda.dtos.response.CursoDetalheDTO;
import com.aprenda.cursos_aprenda.dtos.response.ProfessorResponseDTO;
import com.aprenda.cursos_aprenda.dtos.response.VideoAulaResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Curso;
import com.aprenda.cursos_aprenda.models.ProgressoAula;
import com.aprenda.cursos_aprenda.models.Professor;
import com.aprenda.cursos_aprenda.models.VideoAula;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.CursoRepository;
import com.aprenda.cursos_aprenda.repositories.ProfessorRepository;
import com.aprenda.cursos_aprenda.repositories.ProgressoAulaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class CursoService {
 
    private final CursoRepository cursoRepository;
    private final ProgressoAulaRepository progressoAulaRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
 
    @Transactional(readOnly = true)
    public List<CursoCardDTO> listarTodos() {
        return cursoRepository.findAll().stream()
            .map(this::toCardDTO)
            .toList();
    }
 
    @Transactional(readOnly = true)
    public List<CursoCardDTO> pesquisar(String termo) {
        return cursoRepository.searchByTexto(termo + "*").stream()
            .map(this::toCardDTO)
            .toList();
    }
 
    @Transactional(readOnly = true)
    public CursoDetalheDTO buscarPorId(Integer id) {
        Curso curso = cursoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + id));
 
        return toDetalheDTO(curso, buscarAlunoIdLogado());
    }
 
    @Transactional
    public CursoDetalheDTO criar(CursoRequestDTO dto) {
        Curso curso = toEntity(dto);
        Curso salvo = cursoRepository.save(curso);
        return toDetalheDTO(salvo, buscarAlunoIdLogado());
    }
 
    @Transactional
    public CursoDetalheDTO atualizar(Integer id, CursoRequestDTO dto) {
        Curso curso = findCursoEntityById(id);
        curso.setNome(dto.nome());
        curso.setDescricao(dto.descricao());
        curso.setEmenta(dto.ementa());
        curso.setCargaHoraria(dto.cargaHoraria());
        curso.setNumeroAulas(dto.numeroAulas());
        curso.setPreco(dto.preco());
        curso.setMedia(dto.media());
        curso.setUrlBanner(dto.urlBanner());
        if (dto.professorId() != null) {
            curso.setProfessor(findProfessorById(dto.professorId()));
        } else {
            curso.setProfessor(null);
        }
        Curso atualizado = cursoRepository.save(curso);
        return toDetalheDTO(atualizado, buscarAlunoIdLogado());
    }
 
    @Transactional
    public void deletar(Integer id) {
        findCursoEntityById(id);
        cursoRepository.deleteById(id);
    }
 
    private Curso findCursoEntityById(Integer id) {
        return cursoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + id));
    }
 
    private Professor findProfessorById(Integer id) {
        return professorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado: " + id));
    }
 
    private Curso toEntity(CursoRequestDTO dto) {
        Curso curso = new Curso();
        curso.setNome(dto.nome());
        curso.setDescricao(dto.descricao());
        curso.setEmenta(dto.ementa());
        curso.setCargaHoraria(dto.cargaHoraria());
        curso.setNumeroAulas(dto.numeroAulas());
        curso.setPreco(dto.preco());
        curso.setMedia(dto.media());
        curso.setUrlBanner(dto.urlBanner());
        if (dto.professorId() != null) {
            curso.setProfessor(findProfessorById(dto.professorId()));
        }
        return curso;
    }
 
    private CursoCardDTO toCardDTO(Curso curso) {
        return new CursoCardDTO(
            curso.getId(),
            curso.getNome(),
            curso.getDescricao(),
            curso.getEmenta(),
            curso.getProfessor() != null ? curso.getProfessor().getNome() : null,
            curso.getNumeroAulas(),
            curso.getCargaHoraria(),
            curso.getPreco(),
            curso.getMedia(),
            curso.getNotaAvaliacao(),
            curso.getUrlBanner()
        );
    }
 
    private CursoDetalheDTO toDetalheDTO(Curso curso, Integer alunoId) {
        return new CursoDetalheDTO(
            curso.getId(),
            curso.getNome(),
            curso.getDescricao(),
            curso.getEmenta(),
            curso.getCargaHoraria(),
            curso.getNumeroAulas(),
            curso.getPreco(),
            curso.getMedia(),
            curso.getNotaAvaliacao(),
            curso.getUrlBanner(),
            toProfessorDTO(curso.getProfessor()),
            curso.getVideoAulas().stream()
                .map(video -> toVideoAulaResponseDTO(video, alunoId))
                .toList()
        );
    }
 
    private ProfessorResponseDTO toProfessorDTO(Professor professor) {
        if (professor == null) {
            return null;
        }
        return new ProfessorResponseDTO(
            professor.getId(),
            professor.getNome(),
            professor.getEmail(),
            professor.getFormacao(),
            professor.getTelefone()
        );
    }
 
    private VideoAulaResponseDTO toVideoAulaResponseDTO(VideoAula videoAula, Integer alunoId) {
        boolean assistida = false;
        if (alunoId != null) {
            assistida = progressoAulaRepository
                .findByAlunoIdAndVideoAulaId(alunoId, videoAula.getId())
                .map(ProgressoAula::getAssistida)
                .orElse(false);
        }
 
        return new VideoAulaResponseDTO(
            videoAula.getId(),
            videoAula.getTitulo(),
            videoAula.getDuracao(),
            videoAula.getUrl(),
            assistida
        );
    }
 
    private Integer buscarAlunoIdLogado() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
 
        return alunoRepository.findByEmail(auth.getName())
            .map(Aluno::getId)
            .orElse(null);
    }
}