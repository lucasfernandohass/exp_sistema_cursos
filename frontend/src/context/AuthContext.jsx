import { createContext, useContext, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  // Inicializa a partir do localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null
    } catch {
      return null
    }
  })

  /* LOGIN */
  const signIn = useCallback((userData) => {
    // userData = { token, tipo, id, nome, email }
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }, [])

  /* LOGOUT */
  const signOut = useCallback(() => {
    localStorage.removeItem("user")
    setUser(null)
    navigate("/login")
  }, [navigate])

    /* HELPERS */
  const token = user?.token ?? null
  const isAuthenticated = !!user
  const isAluno = user?.tipo === "ALUNO"
  const isProfessor = user?.tipo === "PROFESSOR"
  const isAdmin = user?.tipo === "ADMINISTRADOR"

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAluno,
        isProfessor,
        isAdmin,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* HOOK */ 

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>")
  }
  return ctx
}