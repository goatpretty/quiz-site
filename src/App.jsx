// @ts-nocheck
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import './styles.css'; 
import './App.css';    
import Home from './pages/Home.jsx'
import Quiz from './pages/Quiz.jsx'

/** 路由切换滚到页面顶部（移动端常用） */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'instant' }) } catch {
      window.scrollTo(0, 0)
    }
  }, [pathname])
  return null
}

export default function App(){
  return (
    <div className="mobile-shell">
      <ScrollToTop />

    
{/* 顶部吸附导航条（含安全区避让） */}
<header className="header safe-area-top">
  <div className="header-inner container">
    <div className="brand" aria-label="题库练习">
      <span className="brand-text">题库练习</span>
    </div>
    <nav>
      <Link className="nav-link" to="/">首页</Link>
    </nav>
  </div>
</header>



      {/* 页面主体容器（统一左右留白 & 底部安全区） */}
      <main className="page-container container safe-area-bottom">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/chapter/:id" element={<Quiz/>} />
        </Routes>
      </main>
    </div>
  )
}
