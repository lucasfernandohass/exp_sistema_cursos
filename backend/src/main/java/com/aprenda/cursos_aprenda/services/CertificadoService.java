package com.aprenda.cursos_aprenda.services;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.aprenda.cursos_aprenda.dtos.response.CertificadoResponseDTO;
import com.aprenda.cursos_aprenda.models.Certificado;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Curso;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.CertificadoRepository;
import com.aprenda.cursos_aprenda.repositories.CursoRepository;
import com.aprenda.cursos_aprenda.repositories.ProgressoAulaRepository;
import com.aprenda.cursos_aprenda.repositories.RespostaAtividadeRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CertificadoService {

    private final CertificadoRepository certificadoRepository;
    private final ProgressoAulaRepository progressoAulaRepository;
    private final RespostaAtividadeRepository respostaAtividadeRepository;
    private final AlunoRepository alunoRepository;
    private final CursoRepository cursoRepository;

    private static final double MEDIA_MINIMA = 6.0;

    @Transactional(readOnly = true)
    public List<CertificadoResponseDTO> listarPorAluno(Integer alunoId) {
        List<Certificado> certificados = certificadoRepository.findByAlunoId(alunoId);
        return certificados.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CertificadoResponseDTO validar(String codigoValidacao) {
        return certificadoRepository.findByCodigoValidacao(codigoValidacao)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Certificado não encontrado"));
    }

    @Transactional
    public CertificadoResponseDTO emitir(Integer alunoId, Integer cursoId) {
        if (certificadoRepository.existsByAlunoIdAndCursoId(alunoId, cursoId))
            throw new IllegalArgumentException("Certificado já emitido para este curso");

        boolean todasAssistidas = Boolean.TRUE.equals(
                progressoAulaRepository.todasAulasAssistidas(alunoId, cursoId)
        );
        if (!todasAssistidas)
            throw new IllegalArgumentException("O aluno não assistiu todas as aulas");

        Double media = respostaAtividadeRepository.calcularMediaPorAlunoCurso(alunoId, cursoId);
        if (media == null || media < MEDIA_MINIMA)
            throw new IllegalArgumentException("Média insuficiente para emissão do certificado: " + media);

        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado: " + alunoId));
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + cursoId));

        String codigo = UUID.randomUUID().toString();

        // Gera o PDF usando os dados do aluno e curso
        byte[] pdfBytes;
        try {
            pdfBytes = gerarPdf(aluno.getNome(), aluno.getCpf(), curso.getNome(), codigo);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao gerar o PDF do certificado", e);
        }

        Certificado certificado = new Certificado();
        certificado.setCodigoValidacao(codigo);
        certificado.setAluno(aluno);
        certificado.setCurso(curso);
        certificado.setConteudoPdf(pdfBytes);

        certificado = certificadoRepository.save(certificado);

        return toDTO(certificado);
    }

    private CertificadoResponseDTO toDTO(Certificado certificado) {
        return new CertificadoResponseDTO(
                certificado.getId(),
                certificado.getCurso() != null ? certificado.getCurso().getId() : null,
                certificado.getAluno() != null ? certificado.getAluno().getNome() : null,
                certificado.getCurso() != null ? certificado.getCurso().getNome() : null,
                certificado.getCurso() != null && certificado.getCurso().getProfessor() != null 
                ? certificado.getCurso().getProfessor().getNome() : null,
                certificado.getDataEmissao(),
                certificado.getCodigoValidacao()
        );
    }
   
    private byte[] gerarPdf(
            String nomeAluno,
            String cpfAluno,
            String nomeCurso,
            String codigo
    ) throws IOException {

        try (PDDocument document = new PDDocument()) {

            PDPage page = new PDPage(
                    new PDRectangle(
                            PDRectangle.A4.getHeight(),
                            PDRectangle.A4.getWidth()
                    )
            );

            document.addPage(page);

            float pageWidth = page.getMediaBox().getWidth();

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {

                Color azul = new Color(26, 35, 126);
                Color azulClaro = new Color(37, 99, 235);
                Color dourado = new Color(212, 175, 55);
                Color cinza = new Color(80, 80, 80);

                // =========================
                // BARRA SUPERIOR
                // =========================
                cs.setNonStrokingColor(azul);
                cs.addRect(36, 520, 730, 35);
                cs.fill();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
                cs.setNonStrokingColor(Color.WHITE);
                cs.newLineAtOffset(60, 531);
                cs.showText("APRENDA+");
                cs.endText();

                // =========================
                // MOLDURA EXTERNA
                // =========================
                cs.setStrokingColor(azulClaro);
                cs.setLineWidth(3f);
                cs.addRect(36, 36, 730, 520);
                cs.stroke();


                // =========================
                // MARCA D'ÁGUA
                // =========================
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 90);
                cs.setNonStrokingColor(new Color(230, 235, 245));
                cs.newLineAtOffset(150, 260);
                cs.showText("APRENDA+");
                cs.endText();

                // =========================
                // TÍTULO
                // =========================
                String titulo = "CERTIFICADO";

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 42);
                cs.setNonStrokingColor(azul);
                cs.newLineAtOffset(
                        centralizarTexto(
                                titulo,
                                PDType1Font.HELVETICA_BOLD,
                                42,
                                pageWidth
                        ),
                        455
                );
                cs.showText(titulo);
                cs.endText();

                cs.setStrokingColor(dourado);
                cs.setLineWidth(1.2f);
                cs.moveTo(260, 438);
                cs.lineTo(540, 438);
                cs.stroke();

                // =========================
                // TEXTO INTRODUTÓRIO
                // =========================
                String intro = "Certificamos que";

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 18);
                cs.setNonStrokingColor(cinza);
                cs.newLineAtOffset(
                        centralizarTexto(
                                intro,
                                PDType1Font.HELVETICA,
                                18,
                                pageWidth
                        ),
                        395
                );
                cs.showText(intro);
                cs.endText();

                // =========================
                // NOME DO ALUNO
                // =========================
                String nome = nomeAluno.toUpperCase();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 30);
                cs.setNonStrokingColor(azulClaro);
                cs.newLineAtOffset(
                        centralizarTexto(
                                nome,
                                PDType1Font.HELVETICA_BOLD,
                                30,
                                pageWidth
                        ),
                        345
                );
                cs.showText(nome);
                cs.endText();

                // =========================
                // CPF
                // =========================
                String cpfTexto = "CPF: " + cpfAluno;

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 14);
                cs.setNonStrokingColor(cinza);
                cs.newLineAtOffset(
                        centralizarTexto(
                                cpfTexto,
                                PDType1Font.HELVETICA,
                                14,
                                pageWidth
                        ),
                        315
                );
                cs.showText(cpfTexto);
                cs.endText();

                // =========================
                // TEXTO CURSO
                // =========================
                String textoCurso =
                        "concluiu com aproveitamento o curso";

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 16);
                cs.setNonStrokingColor(cinza);
                cs.newLineAtOffset(
                        centralizarTexto(
                                textoCurso,
                                PDType1Font.HELVETICA,
                                16,
                                pageWidth
                        ),
                        270
                );
                cs.showText(textoCurso);
                cs.endText();

                // =========================
                // NOME CURSO
                // =========================
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 24);
                cs.setNonStrokingColor(azul);
                cs.newLineAtOffset(
                        centralizarTexto(
                                nomeCurso,
                                PDType1Font.HELVETICA_BOLD,
                                24,
                                pageWidth
                        ),
                        225
                );
                cs.showText(nomeCurso);
                cs.endText();

                // =========================
                // DATA
                // =========================
                String dataAtual = LocalDate.now().format(
                        DateTimeFormatter.ofPattern(
                                "dd 'de' MMMM 'de' yyyy"
                        )
                );

                String emissao =
                        "Emitido em " + dataAtual;

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 14);
                cs.setNonStrokingColor(cinza);
                cs.newLineAtOffset(
                        centralizarTexto(
                                emissao,
                                PDType1Font.HELVETICA,
                                14,
                                pageWidth
                        ),
                        160
                );
                cs.showText(emissao);
                cs.endText();


                // =========================
                // RODAPÉ
                // =========================
                String registro =
                        "Registro: CERT-" +
                        LocalDate.now().getYear() +
                        "-" +
                        codigo.substring(
                                Math.max(0, codigo.length() - 6)
                        );

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 9);
                cs.setNonStrokingColor(new Color(120, 120, 120));
                cs.newLineAtOffset(200, 95);
                cs.showText(registro);
                cs.endText();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 8);
                cs.setNonStrokingColor(new Color(120, 120, 120));
                cs.newLineAtOffset(200, 75);
                cs.showText(
                        "Código de validação: " + codigo
                );
                cs.endText();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_OBLIQUE, 8);
                cs.setNonStrokingColor(new Color(160, 160, 160));
                cs.newLineAtOffset(470, 60);
                cs.showText(
                        "Documento digital emitido pelo Aprenda+"
                );
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);

            return baos.toByteArray();
        }
    }

    private float centralizarTexto(
        String texto,
        PDFont fonte,
        float tamanho,
        float larguraPagina
    ) throws IOException {

        float larguraTexto =
                fonte.getStringWidth(texto) / 1000 * tamanho;

        return (larguraPagina - larguraTexto) / 2;
    }

}