import { useEffect, useState } from "react"

export default function ThemeToggle() {

  const [darkMode, setDarkMode] = useState(false)

  // Carregar tema salvo
  useEffect(() => {

    const savedTheme = localStorage.getItem("theme")

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
      setDarkMode(true)
    }

  }, [])

  // Alternar tema
  function toggleTheme() {

    const html = document.documentElement

    html.classList.toggle("dark")

    const isDark = html.classList.contains("dark")

    setDarkMode(isDark)

    localStorage.setItem(
      "theme",
      isDark ? "dark" : "light"
    )
  }

  return (

    <button
      className="theme-toggle"
      onClick={toggleTheme}
    >

      {darkMode ? "☀️" : "🌙"}

    </button>
  )
}