import { Link, useNavigate } from "react-router-dom"
import { registerAluno } from "../api"
import { useState } from "react"

export default function Register() {

  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState('')
  const [emailState, setEmailState] = useState('')
  const [senhaState, setSenhaState] = useState('')
  const [confirmState, setConfirmState] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [errors, setErrors] = useState({})

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function validateCPF(cpf) {
    if (!cpf) return false
    const s = cpf.replace(/\D/g, '')
    if (s.length !== 11) return false
    if (/^([0-9])\1{10}$/.test(s)) return false

    const nums = s.split('').map(Number)

    const calcCheck = (arr, factor) => {
      let total = 0
      for (let i = 0; i < arr.length; i++) total += arr[i] * (factor - i)
      const mod = total % 11
      return mod < 2 ? 0 : 11 - mod
    }

    const d1 = calcCheck(nums.slice(0, 9), 10)
    const d2 = calcCheck(nums.slice(0, 9).concat(d1), 11)

    return d1 === nums[9] && d2 === nums[10]
  }

  function validatePhone(phone) {
    const s = phone.replace(/\D/g, '')
    return s.length === 10 || s.length === 11
  }

  function generateRA() {
    const year = new Date().getFullYear()
    const prefix = String(year).slice(-2)
    const suffix = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')
    return prefix + suffix
  }

  function formatCPF(value) {
    const s = value.replace(/\D/g, '').slice(0, 11)
    const part1 = s.slice(0, 3)
    const part2 = s.slice(3, 6)
    const part3 = s.slice(6, 9)
    const part4 = s.slice(9, 11)
    let out = ''
    if (part1) out += part1
    if (part2) out += '.' + part2
    if (part3) out += '.' + part3
    if (part4) out += '-' + part4
    return out
  }

  function formatPhone(value) {
    const s = value.replace(/\D/g, '').slice(0, 11)
    if (s.length <= 2) return s
    if (s.length <= 6) return `(${s.slice(0,2)}) ${s.slice(2)}`
    if (s.length <= 10) return `(${s.slice(0,2)}) ${s.slice(2,6)}-${s.slice(6)}`
    // 11 digits
    return `(${s.slice(0,2)}) ${s.slice(2,7)}-${s.slice(7)}`
  }

  function handleCpfChange(e) {
    setCpf(formatCPF(e.target.value))
  }

  function handleTelefoneChange(e) {
    setTelefone(formatPhone(e.target.value))
  }

  async function handleRegister(e) {
    e.preventDefault()
    // limpar erros
    setErrors({})

    // usar estados controlados
    const nomeVal = nome.trim()
    const emailVal = emailState.trim()
    const senha = senhaState
    const confirm = confirmState
    const cpfVal = cpf.trim()
    const telefoneVal = telefone.trim()
    const dataVal = dataNascimento

    const newErrors = {}

    if (!nomeVal) newErrors.nome = 'Nome obrigatório.'
    if (!emailVal) newErrors.email = 'Email obrigatório.'
    else if (!validateEmail(emailVal)) newErrors.email = 'Email inválido.'
    if (!senha) newErrors.senha = 'Senha obrigatória.'
    else if (senha.length < 8) newErrors.senha = 'Senha precisa ter pelo menos 8 caracteres.'
    if (!confirm) newErrors.confirm = 'Confirmação de senha obrigatória.'
    else if (senha !== confirm) newErrors.confirm = 'As senhas não coincidem.'
    if (!cpfVal) newErrors.cpf = 'CPF obrigatório.'
    else if (!validateCPF(cpfVal)) newErrors.cpf = 'CPF inválido.'
    if (!telefoneVal) newErrors.telefone = 'Telefone obrigatório.'
    else if (!validatePhone(telefoneVal)) newErrors.telefone = 'Telefone inválido. Informe 10 ou 11 dígitos.'
    if (!dataVal) newErrors.dataNascimento = 'Data de nascimento obrigatória.'

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    // dataNascimento já vem no formato YYYY-MM-DD do input type=date

    const ra = generateRA()

    const payload = {
      nome: nomeVal,
      email: emailVal,
      senha,
      cpf: cpfVal.replace(/\D/g, ''),
      ra,
      telefone: telefoneVal.replace(/\D/g, ''),
      dataNascimento: dataVal,
    }

    try {
      setLoading(true)
      await registerAluno(payload)
      alert('Conta criada com sucesso! R.A: ' + ra)
      navigate('/login')
    } catch (err) {
      alert('Falha ao criar conta: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">

      <div className="auth-box">

        <Link to="/" className="auth-logo">
          Aprenda+
        </Link>

        <form className="auth-form" onSubmit={handleRegister}>

          <h2>Criar conta</h2>

          <input name="nome" type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
          {errors.nome && <div className="field-error">{errors.nome}</div>}

          <input name="email" type="email" placeholder="Email" value={emailState} onChange={e => setEmailState(e.target.value)} />
          {errors.email && <div className="field-error">{errors.email}</div>}

          <input name="senha" type="password" placeholder="Senha (mín. 8 caracteres)" value={senhaState} onChange={e => setSenhaState(e.target.value)} />
          {errors.senha && <div className="field-error">{errors.senha}</div>}

          <input name="confirm" type="password" placeholder="Confirmar senha" value={confirmState} onChange={e => setConfirmState(e.target.value)} />
          {errors.confirm && <div className="field-error">{errors.confirm}</div>}

          <input name="cpf" type="text" inputMode="numeric" placeholder="CPF" value={cpf} onChange={handleCpfChange} />
          {errors.cpf && <div className="field-error">{errors.cpf}</div>}

          <input name="telefone" type="tel" inputMode="tel" placeholder="Telefone" value={telefone} onChange={handleTelefoneChange} />
          {errors.telefone && <div className="field-error">{errors.telefone}</div>}

          <input name="dataNascimento" type="date" placeholder="Data de nascimento" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
          {errors.dataNascimento && <div className="field-error">{errors.dataNascimento}</div>}

          <button className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <p className="auth-switch">
            Já tem conta?{" "}
            <Link to="/login">
              <span>Entrar</span>
            </Link>
          </p>

        </form>

      </div>

    </div>
  )
}