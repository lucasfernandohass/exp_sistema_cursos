package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.AvaliacaoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.CursoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AvaliacaoResponseDTO;
import com.aprenda.cursos_aprenda.dtos.response.CursoCardDTO;
import com.aprenda.cursos_aprenda.dtos.response.CursoDetalheDTO;
import com.aprenda.cursos_aprenda.dtos.response.ProfessorResponseDTO;
import com.aprenda.cursos_aprenda.dtos.response.VideoAulaResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Curso;
import com.aprenda.cursos_aprenda.models.Matricula;
import com.aprenda.cursos_aprenda.models.ProgressoAula;
import com.aprenda.cursos_aprenda.models.Professor;
import com.aprenda.cursos_aprenda.models.VideoAula;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.CursoRepository;
import com.aprenda.cursos_aprenda.repositories.MatriculaRepository;
import com.aprenda.cursos_aprenda.repositories.ProfessorRepository;
import com.aprenda.cursos_aprenda.repositories.ProgressoAulaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final ProgressoAulaRepository progressoAulaRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final MatriculaRepository matriculaRepository;

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
        Curso curso = findCursoEntityById(id);
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

    /* =========================
       AVALIAÇÃO
    ========================= */

    /**
     * Registra a avaliação de um aluno para um curso e recalcula a média.
     *
     * Regras:
     *  - O aluno deve estar matriculado no curso.
     *  - O aluno só pode avaliar uma vez por curso.
     *  - A nota deve estar entre 1 e 5.
     *
     * Cálculo incremental da média:
     *   novaMedia = (notaAtual * numAvaliacoes + novaNota) / (numAvaliacoes + 1)
     */
    @Transactional
    public AvaliacaoResponseDTO avaliar(Integer cursoId, AvaliacaoRequestDTO dto) {
        Aluno aluno = buscarAlunoLogado();
        Curso curso = findCursoEntityById(cursoId);

        // valida nota entre 1 e 5
        if (dto.nota() < 1 || dto.nota() > 5) {
            throw new IllegalArgumentException("A nota deve estar entre 1 e 5.");
        }

        // verifica se o aluno está matriculado
        boolean matriculado = matriculaRepository
            .existsByAlunoIdAndCursoId(aluno.getId(), cursoId);

        if (!matriculado) {
            throw new IllegalStateException(
                "Apenas alunos matriculados podem avaliar o curso."
            );
        }

        // verifica se o aluno já avaliou este curso
        boolean jaAvaliou = matriculaRepository
            .existsByAlunoIdAndCursoIdAndAvaliacaoNotNull(aluno.getId(), cursoId);

        if (jaAvaliou) {
            throw new IllegalStateException(
                "Você já avaliou este curso."
            );
        }

        // recalcula a média de forma incremental
        int numAtual = curso.getNumeroAvaliacoes() != null ? curso.getNumeroAvaliacoes() : 0;
        BigDecimal notaAtual = curso.getNotaAvaliacao() != null
            ? curso.getNotaAvaliacao()
            : BigDecimal.ZERO;

        BigDecimal novaMedia = notaAtual
            .multiply(BigDecimal.valueOf(numAtual))
            .add(BigDecimal.valueOf(dto.nota()))
            .divide(BigDecimal.valueOf(numAtual + 1), 1, RoundingMode.HALF_UP);

        curso.setNotaAvaliacao(novaMedia);
        curso.setNumeroAvaliacoes(numAtual + 1);

        // registra a nota na matrícula para controle de "já avaliou"
        Matricula matricula = matriculaRepository
            .findByAlunoIdAndCursoId(aluno.getId(), cursoId)
            .orElseThrow(() -> new EntityNotFoundException("Matrícula não encontrada."));

        matricula.setAvaliacao(dto.nota());
        matriculaRepository.save(matricula);
        cursoRepository.save(curso);

        return new AvaliacaoResponseDTO(
            cursoId,
            curso.getNome(),
            dto.nota(),
            novaMedia,
            numAtual + 1
        );
    }

    /* =========================
       HELPERS PRIVADOS
    ========================= */

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
            curso.getNumeroAvaliacoes(),
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
            curso.getNumeroAvaliacoes(),
            curso.getUrlBanner(),
            toProfessorDTO(curso.getProfessor()),
            curso.getVideoAulas().stream()
                .map(video -> toVideoAulaResponseDTO(video, alunoId))
                .toList()
        );
    }

    private ProfessorResponseDTO toProfessorDTO(Professor professor) {
        if (professor == null) return null;
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
        if (auth == null || auth.getName() == null) return null;
        return alunoRepository.findByEmail(auth.getName())
            .map(Aluno::getId)
            .orElse(null);
    }

    private Aluno buscarAlunoLogado() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Usuário não autenticado.");
        }
        return alunoRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado."));
    }
}