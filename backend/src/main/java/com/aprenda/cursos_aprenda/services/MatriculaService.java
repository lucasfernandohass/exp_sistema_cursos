package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.MatriculaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.PagamentoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.MatriculaResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Curso;
import com.aprenda.cursos_aprenda.models.Matricula;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.CertificadoRepository;
import com.aprenda.cursos_aprenda.repositories.CursoRepository;
import com.aprenda.cursos_aprenda.repositories.MatriculaRepository;
import com.aprenda.cursos_aprenda.repositories.ProgressoAulaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final AlunoRepository alunoRepository;
    private final CursoRepository cursoRepository;
    private final ProgressoAulaRepository progressoAulaRepository;
    private final CertificadoRepository certificadoRepository;

    @Transactional(readOnly = true)
    public List<MatriculaResponseDTO> listarPorAluno(Integer alunoId) {
        validarAlunoLogado(alunoId);
        return matriculaRepository.findByAlunoId(alunoId).stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public MatriculaResponseDTO buscarPorAlunoECurso(Integer alunoId, Integer cursoId) {
        validarAlunoLogado(alunoId);
        return matriculaRepository.findByAlunoIdAndCursoId(alunoId, cursoId)
            .map(this::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Matricula nao encontrada"));
    }

    @Transactional
    public MatriculaResponseDTO matricular(MatriculaRequestDTO dto) {
        Aluno aluno = buscarAlunoLogado();
        Curso curso = cursoRepository.findById(dto.cursoId())
            .orElseThrow(() -> new EntityNotFoundException("Curso nao encontrado: " + dto.cursoId()));

        if (matriculaRepository.existsByAlunoIdAndCursoId(aluno.getId(), curso.getId())) {
            throw new IllegalArgumentException("Aluno ja matriculado neste curso");
        }

        Matricula matricula = new Matricula();
        matricula.setId(new Matricula.MatriculaId(aluno.getId(), curso.getId()));
        matricula.setAluno(aluno);
        matricula.setCurso(curso);
        matricula.setModalidadePagamento(parseModalidade(dto.modalidadePagamento()));
        matricula.setNumeroParcelas(validarParcelas(matricula.getModalidadePagamento(), dto.numeroParcelas()));
        matricula.setDataMatricula(LocalDateTime.now());

        if (cursoGratuito(curso)) {
            matricula.setStatusPagamento(Matricula.StatusPagamento.PAGO);
            matricula.setDataPagamento(LocalDateTime.now());
        } else {
            matricula.setStatusPagamento(Matricula.StatusPagamento.PENDENTE);
        }

        return toDTO(matriculaRepository.save(matricula));
    }

    @Transactional
    public MatriculaResponseDTO atualizarPagamento(Integer alunoId, Integer cursoId, String status) {
        Matricula matricula = buscarMatriculaDoAlunoLogado(alunoId, cursoId);
        Matricula.StatusPagamento novoStatus = parseStatus(status);

        if (matricula.getStatusPagamento() == Matricula.StatusPagamento.PAGO) {
            throw new IllegalArgumentException("Matricula ja esta paga e nao pode ter o pagamento alterado");
        }

        matricula.setStatusPagamento(novoStatus);
        matricula.setDataPagamento(novoStatus == Matricula.StatusPagamento.PAGO ? LocalDateTime.now() : null);
        return toDTO(matriculaRepository.save(matricula));
    }

    @Transactional
    public MatriculaResponseDTO gerarCobranca(Integer alunoId, Integer cursoId, String tipo) {
        Matricula matricula = buscarMatriculaDoAlunoLogado(alunoId, cursoId);

        if (matricula.getStatusPagamento() == Matricula.StatusPagamento.PAGO) {
            throw new IllegalArgumentException("Matricula ja esta paga; gere a segunda via do comprovante");
        }
        if (matricula.getStatusPagamento() == Matricula.StatusPagamento.CANCELADO) {
            throw new IllegalArgumentException("Matricula cancelada nao pode gerar cobranca");
        }
        if (cursoGratuito(matricula.getCurso())) {
            matricula.setStatusPagamento(Matricula.StatusPagamento.PAGO);
            matricula.setDataPagamento(LocalDateTime.now());
            return toDTO(matriculaRepository.save(matricula));
        }

        Matricula.TipoCobranca tipoCobranca = parseTipoCobranca(tipo);
        String codigo = "MAT-" + alunoId + "-" + cursoId + "-"
            + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        matricula.setTipoCobranca(tipoCobranca);
        matricula.setCodigoCobranca(codigo);
        matricula.setDataCobranca(LocalDateTime.now());
        matricula.setLinkPagamento(tipoCobranca == Matricula.TipoCobranca.LINK
            ? "https://pagamentos.aprenda.local/" + codigo
            : "23790.00000 00000.000000 00000.000000 0 00000000000000");

        return toDTO(matriculaRepository.save(matricula));
    }

    @Transactional
    public MatriculaResponseDTO gerarCobrancaAlunoLogado(Integer cursoId, String tipo) {
        Aluno aluno = buscarAlunoLogado();
        return gerarCobranca(aluno.getId(), cursoId, tipo);
    }

    @Transactional
    public MatriculaResponseDTO registrarPagamento(Integer alunoId, Integer cursoId, PagamentoRequestDTO dto) {
        Matricula matricula = buscarMatriculaDoAlunoLogado(alunoId, cursoId);

        if (matricula.getStatusPagamento() == Matricula.StatusPagamento.PAGO) {
            throw new IllegalArgumentException("Pagamento ja registrado para esta matricula");
        }
        if (matricula.getStatusPagamento() == Matricula.StatusPagamento.CANCELADO) {
            throw new IllegalArgumentException("Matricula cancelada nao pode receber pagamento");
        }
        if (!cursoGratuito(matricula.getCurso()) && matricula.getCodigoCobranca() == null) {
            gerarCobranca(alunoId, cursoId, dto.formaPagamento());
            matricula = buscarMatriculaDoAlunoLogado(alunoId, cursoId);
        }

        matricula.setStatusPagamento(Matricula.StatusPagamento.PAGO);
        matricula.setDataPagamento(LocalDateTime.now());
        return toDTO(matriculaRepository.save(matricula));
    }

    @Transactional
    public MatriculaResponseDTO registrarPagamentoAlunoLogado(Integer cursoId, PagamentoRequestDTO dto) {
        Aluno aluno = buscarAlunoLogado();
        return registrarPagamento(aluno.getId(), cursoId, dto);
    }

    @Transactional
    public void cancelar(Integer alunoId, Integer cursoId) {
        Matricula matricula = buscarMatriculaDoAlunoLogado(alunoId, cursoId);
        matricula.setStatusPagamento(Matricula.StatusPagamento.CANCELADO);
        matriculaRepository.save(matricula);
    }

    private MatriculaResponseDTO toDTO(Matricula matricula) {
        Integer alunoId = matricula.getAluno().getId();
        Integer cursoId = matricula.getCurso().getId();
        Integer numeroAulas = matricula.getCurso().getNumeroAulas();
        int totalAulas = numeroAulas != null ? numeroAulas : 0;
        int aulasConcluidas = (int) progressoAulaRepository.findByAlunoId(alunoId).stream()
            .filter(progress -> progress.getVideoAula().getCurso().getId().equals(cursoId))
            .filter(progress -> Boolean.TRUE.equals(progress.getAssistida()))
            .count();
        boolean certificadoDisponivel = certificadoRepository.existsByAlunoIdAndCursoId(alunoId, cursoId);

        return new MatriculaResponseDTO(
            cursoId,
            matricula.getCurso().getNome(),
            matricula.getCurso().getProfessor() != null ? matricula.getCurso().getProfessor().getNome() : null,
            matricula.getCurso().getUrlBanner(),
            totalAulas,
            aulasConcluidas,
            matricula.getMediaFinal(),
            matricula.getModalidadePagamento().name(),
            matricula.getNumeroParcelas(),
            matricula.getStatusPagamento().name(),
            matricula.getDataMatricula(),
            matricula.getTipoCobranca() != null ? matricula.getTipoCobranca().name() : null,
            matricula.getCodigoCobranca(),
            matricula.getLinkPagamento(),
            matricula.getDataCobranca(),
            matricula.getDataPagamento(),
            certificadoDisponivel
        );
    }

    private Matricula buscarMatriculaDoAlunoLogado(Integer alunoId, Integer cursoId) {
        validarAlunoLogado(alunoId);
        return matriculaRepository.findByAlunoIdAndCursoId(alunoId, cursoId)
            .orElseThrow(() -> new EntityNotFoundException("Matricula nao encontrada"));
    }

    private void validarAlunoLogado(Integer alunoId) {
        Aluno aluno = buscarAlunoLogado();
        if (!aluno.getId().equals(alunoId)) {
            throw new IllegalArgumentException("Operacao permitida apenas para o aluno autenticado");
        }
    }

    private Aluno buscarAlunoLogado() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Aluno nao autenticado");
        }

        return alunoRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new EntityNotFoundException("Aluno nao encontrado para email: " + auth.getName()));
    }

    private Matricula.ModalidadePagamento parseModalidade(String modalidadePagamento) {
        if (modalidadePagamento == null || modalidadePagamento.isBlank()) {
            return Matricula.ModalidadePagamento.AVISTA;
        }

        try {
            return Matricula.ModalidadePagamento.valueOf(modalidadePagamento.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Modalidade de pagamento invalida");
        }
    }

    private Matricula.StatusPagamento parseStatus(String status) {
        try {
            return Matricula.StatusPagamento.valueOf(status.toUpperCase());
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("Status de pagamento invalido");
        }
    }

    private Matricula.TipoCobranca parseTipoCobranca(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return Matricula.TipoCobranca.LINK;
        }

        try {
            return Matricula.TipoCobranca.valueOf(tipo.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Tipo de cobranca invalido");
        }
    }

    private Integer validarParcelas(Matricula.ModalidadePagamento modalidade, Integer numeroParcelas) {
        if (modalidade == Matricula.ModalidadePagamento.AVISTA) {
            return 1;
        }
        if (numeroParcelas == null || numeroParcelas < 2 || numeroParcelas > 12) {
            throw new IllegalArgumentException("Pagamento parcelado deve ter entre 2 e 12 parcelas");
        }
        return numeroParcelas;
    }

    private boolean cursoGratuito(Curso curso) {
        return curso.getPreco() == null || curso.getPreco().compareTo(BigDecimal.ZERO) <= 0;
    }
}
