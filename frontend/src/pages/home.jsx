import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import Courses from "../components/Courses"
import Banner from "../components/Banner"
import Footer from "../components/Footer"
import ThemeToggle from "../components/ThemeToggle"

import "../styles/hero.css";
import "../styles/courses.css";

export default function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <Courses limite={6}/>

      <Banner />

      <Footer />

      <ThemeToggle />
    </>
  )
}