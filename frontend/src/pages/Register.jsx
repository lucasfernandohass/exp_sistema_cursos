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
  const [touched, setTouched] = useState({})
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmSenha, setShowConfirmSenha] = useState(false)

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

  function cleanNameValue(value) {
    return value.replace(/[^A-Za-zÀ-ÿ\s]/g, '')
  }

  function setFieldError(field, error) {
    setErrors((prev) => {
      const next = { ...prev }
      if (error) next[field] = error
      else delete next[field]
      return next
    })
  }

  function validateField(field, value) {
    const text = String(value ?? '').trim()
    let error = ''

    if (field === 'nome') {
      if (!text) {
        error = 'Nome obrigatório.'
      } else {
        const validName = /^[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)+$/
        const parts = text.split(/\s+/).filter(Boolean)
        if (!validName.test(text) || parts.length < 2) {
          error = 'Informe nome e sobrenome usando apenas letras.'
        } else if (parts.some((part) => part.length < 2)) {
          error = 'Cada parte do nome deve ter ao menos 2 letras.'
        }
      }
    }

    if (field === 'email') {
      if (!text) error = 'Email obrigatório.'
      else if (!validateEmail(text)) error = 'Email inválido.'
    }

    if (field === 'senha') {
      if (!value) error = 'Senha obrigatória.'
      else if (value.length < 8) error = 'Senha precisa ter pelo menos 8 caracteres.'
    }

    if (field === 'confirm') {
      if (!value) error = 'Confirmação de senha obrigatória.'
      else if (value !== senhaState) error = 'As senhas não coincidem.'
    }

    if (field === 'cpf') {
      if (!text) error = 'CPF obrigatório.'
      else if (!validateCPF(text)) error = 'CPF inválido.'
    }

    if (field === 'telefone') {
      if (!text) error = 'Telefone obrigatório.'
      else if (!validatePhone(text)) error = 'Telefone inválido. Informe 10 ou 11 dígitos.'
    }

    if (field === 'dataNascimento') {
      if (!text) error = 'Data de nascimento obrigatória.'
    }

    setFieldError(field, error)
    return error
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === 'nome') validateField(field, nome)
    if (field === 'email') validateField(field, emailState)
    if (field === 'senha') validateField(field, senhaState)
    if (field === 'confirm') validateField(field, confirmState)
    if (field === 'cpf') validateField(field, cpf)
    if (field === 'telefone') validateField(field, telefone)
    if (field === 'dataNascimento') validateField(field, dataNascimento)
  }

  function handleCpfChange(e) {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
    if (touched.cpf) validateField('cpf', formatted)
  }

  function handleTelefoneChange(e) {
    const formatted = formatPhone(e.target.value)
    setTelefone(formatted)
    if (touched.telefone) validateField('telefone', formatted)
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
      setTouched({
        nome: true,
        email: true,
        senha: true,
        confirm: true,
        cpf: true,
        telefone: true,
        dataNascimento: true,
      })
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
          <span className="auth-logo-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 10L12 15L2 10L12 5L22 10Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 10V14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Aprenda+
        </Link>

        <form className="auth-form" onSubmit={handleRegister}>

          <h2>Criar conta</h2>

          <input
            name="nome"
            type="text"
            placeholder="Nome e sobrenome"
            value={nome}
            onChange={(e) => {
              const nextValue = cleanNameValue(e.target.value)
              setNome(nextValue)
              if (touched.nome) validateField('nome', nextValue)
            }}
            onBlur={() => handleBlur('nome')}
            className={errors.nome ? 'input-error' : ''}
          />
          {errors.nome && <div className="field-error">{errors.nome}</div>}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={emailState}
            onChange={(e) => {
              setEmailState(e.target.value)
              if (touched.email) validateField('email', e.target.value)
            }}
            onBlur={() => handleBlur('email')}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}

          <div className="input-with-icon">
            <input
              name="senha"
              type={showSenha ? 'text' : 'password'}
              placeholder="Senha (mín. 8 caracteres)"
              value={senhaState}
              onChange={(e) => {
                setSenhaState(e.target.value)
                if (touched.senha) validateField('senha', e.target.value)
                if (touched.confirm) validateField('confirm', confirmState)
              }}
              onBlur={() => handleBlur('senha')}
              className={errors.senha ? 'input-error' : ''}
            />
            <button type="button" className="input-icon-btn" onClick={() => setShowSenha(s => !s)} aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              {showSenha ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </button>
          </div>
          {errors.senha && <div className="field-error">{errors.senha}</div>}

          <div className="input-with-icon">
            <input
              name="confirm"
              type={showConfirmSenha ? 'text' : 'password'}
              placeholder="Confirmar senha"
              value={confirmState}
              onChange={(e) => {
                setConfirmState(e.target.value)
                if (touched.confirm) validateField('confirm', e.target.value)
              }}
              onBlur={() => handleBlur('confirm')}
              className={errors.confirm ? 'input-error' : ''}
            />
            <button type="button" className="input-icon-btn" onClick={() => setShowConfirmSenha(s => !s)} aria-label={showConfirmSenha ? 'Ocultar confirmação' : 'Mostrar confirmação'}>
              {showConfirmSenha ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </button>
          </div>
          {errors.confirm && <div className="field-error">{errors.confirm}</div>}

          <input
            name="cpf"
            type="text"
            inputMode="numeric"
            placeholder="CPF"
            value={cpf}
            onChange={handleCpfChange}
            onBlur={() => handleBlur('cpf')}
            className={errors.cpf ? 'input-error' : ''}
          />
          {errors.cpf && <div className="field-error">{errors.cpf}</div>}

          <input
            name="telefone"
            type="tel"
            inputMode="tel"
            placeholder="Telefone"
            value={telefone}
            onChange={handleTelefoneChange}
            onBlur={() => handleBlur('telefone')}
            className={errors.telefone ? 'input-error' : ''}
          />
          {errors.telefone && <div className="field-error">{errors.telefone}</div>}

          <input
            name="dataNascimento"
            type="date"
            placeholder="Data de nascimento"
            value={dataNascimento}
            onChange={(e) => {
              setDataNascimento(e.target.value)
              if (touched.dataNascimento) validateField('dataNascimento', e.target.value)
            }}
            onBlur={() => handleBlur('dataNascimento')}
            className={errors.dataNascimento ? 'input-error' : ''}
          />
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