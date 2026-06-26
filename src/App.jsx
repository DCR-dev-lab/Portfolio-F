import { useState } from "react"

import { BrowserRouter as Router } from "react-router-dom"
import AppRoutes from "./routes/AppRoutes.jsx"

import { ThemeContext } from "./context/ThemeContext.jsx"



const App = () => {
  const [theme, setTheme] = useState("light") // Example theme state
  return (
    <Router>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <AppRoutes />
      </ThemeContext.Provider>
    </Router>
  )
}

export default App
