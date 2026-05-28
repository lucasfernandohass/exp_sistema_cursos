import { Routes, Route } from "react-router-dom"
import EnrolledCourses from "./pages/EnrolledCourses"
import Course from "./pages/Course"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"

export default function App() {
  return (
    <Routes>
      <Route path="/course/:id" element={<Course />} />
      <Route path="/matriculados" element={<EnrolledCourses />}/>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />

    </Routes>
  )
}