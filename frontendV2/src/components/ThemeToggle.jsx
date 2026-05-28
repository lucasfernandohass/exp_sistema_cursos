import { useEffect, useState } from "react"

export default function ThemeToggle() {

  const [darkMode, setDarkMode] = useState(false)

  /* =========================
     CARREGAR TEMA
  ========================= */

  useEffect(() => {

    const savedTheme =
      localStorage.getItem("theme")

    if (savedTheme === "dark") {

      document.documentElement
        .classList.add("dark")

      setDarkMode(true)
    }

  }, [])

  /* =========================
     TOGGLE THEME
  ========================= */

  function toggleTheme() {

    const html =
      document.documentElement

    html.classList.toggle("dark")

    const isDark =
      html.classList.contains("dark")

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

      {darkMode ? (

        /* SOL */

        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >

          <circle
            cx="12"
            cy="12"
            r="5"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M12 1V3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M12 21V23"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M4.22 4.22L5.64 5.64"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M18.36 18.36L19.78 19.78"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M1 12H3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M21 12H23"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M4.22 19.78L5.64 18.36"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M18.36 5.64L19.78 4.22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

        </svg>

      ) : (

        /* LUA */

        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >

          <path
            d="M21 12.79C20.8427 14.4922 20.2032 16.1144 19.1582 17.4668C18.1131 18.8192 16.7048 19.8465 15.0975 20.4285C13.4901 21.0105 11.7501 21.1231 10.0817 20.7536C8.41328 20.3842 6.88303 19.5475 5.67319 18.338C4.46335 17.1285 3.62607 15.5985 3.25611 13.9302C2.88615 12.2619 2.99817 10.5218 3.57962 8.91427C4.16107 7.30673 5.18788 5.89809 6.53995 4.85262C7.89202 3.80715 9.51404 3.16714 11.216 3C10.2192 4.34827 9.73913 6.00833 9.86217 7.68026C9.98521 9.35218 10.7036 10.9258 11.8879 12.1101C13.0722 13.2944 14.6458 14.0128 16.3177 14.1358C17.9897 14.2589 19.6497 13.7788 21 12.79Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

        </svg>

      )}

    </button>
  )
}