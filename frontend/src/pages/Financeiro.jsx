import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import DashboardNavbar from "../components/DashboardNavbar"
import ThemeToggle from "../components/ThemeToggle"

import {
  detalharCurso,
  detalharMatricula,
  gerarCobrancaCurso,
  matricular,
  registrarPagamentoCurso,
} from "../api"
import { useAuth } from "../context/AuthContext"

export default function Financeiro() {
  const { cursoId } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [curso, setCurso] = useState(null)
  const [matricula, setMatricula] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingEnrollment, setCheckingEnrollment] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [processing, setProcessing] = useState(false)

  const [modalidade, setModalidade] = useState("AVISTA")
  const [parcelas, setParcelas] = useState(2)
  const [tipoCobranca, setTipoCobranca] = useState("LINK")

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        setError(null)
        const data = await detalharCurso(cursoId)
        setCurso(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (cursoId) carregar()
  }, [cursoId])

  useEffect(() => {
    let ignore = false

    async function check() {
      if (!user || !cursoId || loading || !curso) {
        setCheckingEnrollment(false)
        return
      }

      try {
        const data = await detalharMatricula(user.id, cursoId, token)
        if (!ignore) {
          setMatricula(data)
          setModalidade(data.modalidadePagamento || "AVISTA")
          setParcelas(data.numeroParcelas || 1)
          setTipoCobranca(data.tipoCobranca || "LINK")
        }
      } catch {
        if (!ignore) setMatricula(null)
      } finally {
        if (!ignore) setCheckingEnrollment(false)
      }
    }

    check()
    return () => { ignore = true }
  }, [user, cursoId, token, loading, curso])

  function formatarPreco(preco) {
    if (!preco && preco !== 0) return "A definir"
    if (Number(preco) === 0) return "Gratis"
    return Number(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  function formatarData(data) {
    if (!data) return "A definir"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  function formaPagamentoLabel() {
    const base = matricula?.modalidadePagamento || modalidade
    if (precoNum === 0) return "Gratuito"
    if (base === "PARCELADO") return `Parcelado em ${matricula?.numeroParcelas || parcelas}x`
    return "A vista"
  }

  async function handleEnroll() {
    try {
      setProcessing(true)
      setError(null)
      setMessage(null)

      const data = await matricular(
        {
          cursoId: Number(cursoId),
          modalidadePagamento: modalidade,
          numeroParcelas: modalidade === "PARCELADO" ? parcelas : 1,
        },
        token
      )

      setMatricula(data)
      setMessage(
        data.statusPagamento === "PAGO"
          ? "Matricula gratuita confirmada com sucesso."
          : "Matricula criada. Gere a cobranca ou registre o pagamento para confirmar."
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleGerarCobranca() {
    try {
      setProcessing(true)
      setError(null)
      setMessage(null)
      const data = await gerarCobrancaCurso(cursoId, tipoCobranca, token)
      setMatricula(data)
      setMessage(tipoCobranca === "BOLETO" ? "Boleto gerado com sucesso." : "Link de pagamento gerado com sucesso.")
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleRegistrarPagamento() {
    try {
      setProcessing(true)
      setError(null)
      setMessage(null)
      const data = await registrarPagamentoCurso(cursoId, tipoCobranca, token)
      setMatricula(data)
      setMessage("Pagamento registrado com sucesso. Matricula confirmada.")
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  function handleComprovante() {
    setMessage(
      `Segunda via disponivel. Comprovante: ${matricula?.codigoCobranca || `GRATIS-${cursoId}`}.`
    )
  }

  const precoNum = Number(curso?.preco) || 0
  const isPago = matricula?.statusPagamento === "PAGO" || precoNum === 0
  function renderResumo() {
    return (
      <div className="financeiro-summary">
        <div>
          <span>Curso</span>
          <strong>{curso.nome}</strong>
        </div>
        <div>
          <span>Inicio</span>
          <strong>{formatarData(curso.dataInicio || curso.data_inicio)}</strong>
        </div>
        <div>
          <span>Valor</span>
          <strong>{formatarPreco(curso.preco)}</strong>
        </div>
        <div>
          <span>Forma de pagamento</span>
          <strong>{formaPagamentoLabel()}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong className={`financeiro-status ${isPago ? "pago" : "pendente"}`}>
            {isPago ? "Paga" : "Pendente"}
          </strong>
        </div>
      </div>
    )
  }

  function renderMatriculaActions() {
    if (!matricula) return null

    if (isPago) {
      return (
        <button className="btn-primary" onClick={handleComprovante} disabled={processing}>
          Gerar segunda via de comprovante
        </button>
      )
    }

    return (
      <>
        <div className="financeiro-charge-row">
          <select value={tipoCobranca} onChange={(e) => setTipoCobranca(e.target.value)} disabled={processing}>
            <option value="LINK">Link de pagamento</option>
            <option value="BOLETO">Boleto</option>
          </select>
          <button className="btn-secondary" onClick={handleGerarCobranca} disabled={processing}>
            Gerar cobranca
          </button>
        </div>

        {matricula.codigoCobranca && (
          <div className="financeiro-cobranca">
            <span>{matricula.tipoCobranca === "BOLETO" ? "Linha digitavel" : "Link"}</span>
            <strong>{matricula.linkPagamento}</strong>
          </div>
        )}

        <button className="btn-primary" onClick={handleRegistrarPagamento} disabled={processing}>
          {processing ? "Processando..." : "Registrar pagamento"}
        </button>
      </>
    )
  }

  function renderEnrollmentForm() {
    return (
      <>
        <div className="financeiro-header">
          <h2 className="financeiro-nome">{curso.nome}</h2>
          <span className="financeiro-preco">{formatarPreco(curso.preco)}</span>
        </div>

        {precoNum === 0 && <span className="financeiro-gratis">Gratis</span>}

        {precoNum > 0 && (
          <>
            <div className="payment-options">
              <label className={`payment-option${modalidade === "AVISTA" ? " selected" : ""}`}>
                <input
                  type="radio"
                  name="modalidade"
                  checked={modalidade === "AVISTA"}
                  onChange={() => setModalidade("AVISTA")}
                />
                <span>A vista</span>
              </label>
              <label className={`payment-option${modalidade === "PARCELADO" ? " selected" : ""}`}>
                <input
                  type="radio"
                  name="modalidade"
                  checked={modalidade === "PARCELADO"}
                  onChange={() => setModalidade("PARCELADO")}
                />
                <span>Parcelado</span>
              </label>
            </div>

            {modalidade === "PARCELADO" && (
              <div className="payment-parcelas">
                <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}>
                  {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                    <option key={n} value={n}>
                      {n}x de {formatarPreco(precoNum / n)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <button className="btn-primary" onClick={handleEnroll} disabled={processing}>
          {processing
            ? "Confirmando..."
            : precoNum === 0
              ? "Confirmar matricula gratuita"
              : "Criar matricula"}
        </button>
      </>
    )
  }

  function renderBody() {
    if (loading || checkingEnrollment) {
      return (
        <>
          <div className="skeleton" style={{ height: 16, width: "65%", borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 14, width: "35%", borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 44, borderRadius: 10 }} />
        </>
      )
    }

    if (error && !curso) {
      return (
        <div className="financeiro-body-center">
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/cursos")}>
            Ver todos os cursos
          </button>
        </div>
      )
    }

    return (
      <>
        {matricula ? renderResumo() : renderEnrollmentForm()}
        {matricula && renderMatriculaActions()}
        {message && <div className="financeiro-sucesso">{message}</div>}
        {error && <div className="financeiro-erro">{error}</div>}
      </>
    )
  }

  return (
    <div className="dashboard-layout">
      <DashboardNavbar />

      <main className="dashboard-main financeiro-main">
        <div className="financeiro-card">
          {curso && (
            <div className="financeiro-card-banner">
              <span className="financeiro-card-banner-text">
                {curso.nome
                  ?.split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
          )}
          <div className="financeiro-card-body">{renderBody()}</div>
        </div>
      </main>

      <ThemeToggle />
    </div>
  )
}
