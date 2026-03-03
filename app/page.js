"use client"
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'

// ─── Animation Variants ───────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
}
const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
}

// ─── Animated Section Wrapper ─────────────────────────────────────
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: 'easeOut' } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Typing Effect Hook ──────────────────────────────────────────
const useTypingEffect = (texts, typingSpeed = 80, deletingSpeed = 40, pauseDuration = 2000) => {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentText = texts[textIndex]
    let timeout

    if (!isDeleting && charIndex < currentText.length) {
      timeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      }, typingSpeed)
    } else if (!isDeleting && charIndex === currentText.length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration)
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      }, deletingSpeed)
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false)
      setTextIndex((textIndex + 1) % texts.length)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration])

  return displayText
}

// ─── Particle Background ─────────────────────────────────────────
const ParticleBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.1
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(6, 182, 212, ${this.opacity})`
        ctx.fill()
      }
    }

    for (let i = 0; i < 80; i++) {
      particles.push(new Particle())
    }

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.08 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      connectParticles()
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

// ─── Glow Card ───────────────────────────────────────────────────
const GlowCard = ({ children, className = '', glowColor = 'cyan' }) => {
  const colors = {
    cyan: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
    violet: 'hover:border-violet-500/40 hover:shadow-violet-500/10',
    emerald: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    orange: 'hover:border-orange-500/40 hover:shadow-orange-500/10',
  }
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl shadow-2xl hover:shadow-2xl transition-all duration-500 ${colors[glowColor] || colors.cyan} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03]" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ─── Section Title ───────────────────────────────────────────────
const SectionTitle = ({ title, subtitle }) => (
  <AnimatedSection className="text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{title}</h2>
    {subtitle && <p className="text-slate-400 text-lg max-w-2xl mx-auto">{subtitle}</p>}
    <div className="flex items-center justify-center mt-6 gap-2">
      <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-cyan-500" />
      <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse-glow" />
      <div className="w-24 h-[2px] bg-gradient-to-r from-cyan-500 to-violet-500" />
      <div className="w-3 h-3 rounded-full bg-violet-500 animate-pulse-glow" />
      <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-violet-500" />
    </div>
  </AnimatedSection>
)

// ─── Counter Animation ───────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const step = target / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.round(start * 100) / 100)
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// ─── Navbar ──────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const sections = ['contact', 'certifications', 'projects', 'experience', 'education', 'about']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 200) {
          setActiveSection(id)
          break
        }
      }
    }
    const handleResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false) }
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('resize', handleResize) }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileMenuOpen])

  const navItems = ['About', 'Education', 'Experience', 'Projects', 'Certifications', 'Contact']

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/10 shadow-lg shadow-cyan-500/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.a href="#hero" whileHover={{ scale: 1.05 }} className="flex-shrink-0 font-mono text-xl font-bold">
              <span className="text-cyan-400">&lt;</span>
              <span className="text-slate-200">Raghuram</span>
              <span className="text-cyan-400"> /&gt;</span>
            </motion.a>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                    activeSection === item.toLowerCase() ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  {item}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300 ${
                    activeSection === item.toLowerCase() ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </a>
              ))}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-cyan-400 transition-colors" aria-label="Toggle menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 z-50 bg-slate-950/95 backdrop-blur-xl border-l border-cyan-500/10 md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
                <span className="text-slate-300 font-mono text-sm">{/* navigation */}nav_menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-cyan-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-1">
                {navItems.map((item, i) => (
                  <motion.a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="block px-4 py-3 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-lg transition-all text-sm font-medium"
                  >
                    <span className="text-cyan-500/50 font-mono mr-2">0{i + 1}.</span>{item}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Hero Section ────────────────────────────────────────────────
const Hero = () => {
  const typedText = useTypingEffect([
    'Full Stack Developer',
    'Embedded-System Programmer',
    'App Developer',
    'Problem Solver'
  ], 80, 50, 2000)

  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <motion.section id="hero" style={{ opacity, scale }}
      className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden"
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }} className="mb-8">
          <div className="w-40 h-40 mx-auto rounded-full p-[3px] bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 animate-border-glow shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
              <Image src="/profile-pic.png" alt="Raghuram" width={160} height={160}
                className="w-full h-full object-cover rounded-full" style={{ objectPosition: 'center top' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
              <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-violet-600 flex items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                <span className="text-5xl font-bold text-white">R</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5">
          <span className="text-cyan-400 font-mono text-sm">
            <span className="text-emerald-400">●</span> available for opportunities
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }} className="text-5xl md:text-7xl font-bold mb-4">
          <span className="text-slate-100">Hi, I&apos;m </span>
          <span className="gradient-text glow-text">Raghuram Srikanth</span>
        </motion.h1>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-slate-400 mb-4 h-8 font-mono">
          <span className="text-cyan-400">&gt; </span>{typedText}<span className="typing-cursor text-cyan-400">|</span>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
          Computer Science &amp; Engineering Student at SRM IST — Building the future with code, circuits, and creativity.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-8 mb-10">
          {[
            { value: 9.13, suffix: '', label: 'CGPA' },
            { value: 6, suffix: '+', label: 'Projects' },
            { value: 3, suffix: '+', label: 'Internships' },
            { value: 5, suffix: '+', label: 'Certifications' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-cyan-400 font-mono">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
          className="flex flex-wrap justify-center gap-4">
          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="https://github.com/raghu-ram1104"
            target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-shadow duration-300">
            View My Work
          </motion.a>
          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            href="https://drive.google.com/file/d/15Be6uIBBJ092N1Oy8Ir2BHQvqF7cs0i-/view?usp=sharing"
            target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-full border border-cyan-500/30 text-cyan-400 font-medium hover:bg-cyan-500/10 transition-all duration-300">
            View Resume
          </motion.a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-cyan-500/30 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-cyan-400" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

// ─── Skill Bar ───────────────────────────────────────────────────
const SkillBar = ({ name, level, color, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300 font-medium">{name}</span>
        <span className="text-slate-500 font-mono">{level}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={isInView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`} />
      </div>
    </div>
  )
}

// ─── About Section ───────────────────────────────────────────────
const About = () => {
  const techCategories = [
    { category: 'Languages', icon: '⌨️', color: 'cyan', items: [
      { name: 'C', icon: '🔵' }, { name: 'Java', icon: '☕' }, { name: 'Python', icon: '🐍' }, { name: 'JavaScript', icon: '⚡' }, { name: 'SQL', icon: '🗃️' },
    ]},
    { category: 'Frontend', icon: '🎨', color: 'violet', items: [
      { name: 'HTML5', icon: '🌐' }, { name: 'CSS3', icon: '🎭' }, { name: 'React', icon: '⚛️' }, { name: 'Next.js', icon: '▲' }, { name: 'Tailwind CSS', icon: '💨' },
    ]},
    { category: 'Backend & DB', icon: '🛢️', color: 'emerald', items: [
      { name: 'Node.js', icon: '🟢' }, { name: 'Express.js', icon: '🚂' }, { name: 'MySQL', icon: '🐬' }, { name: 'MongoDB', icon: '🍃' }, { name: 'Supabase', icon: '⚡' },
    ]},
    { category: 'Embedded & IoT', icon: '🔌', color: 'orange', items: [
      { name: 'Arduino', icon: '🤖' }, { name: 'ESP32', icon: '📡' }, { name: 'TensorFlow Lite', icon: '🧠' }, { name: 'Embedded C++', icon: '⚙️' },
    ]},
    { category: 'Cloud & DevOps', icon: '☁️', color: 'cyan', items: [
      { name: 'AWS', icon: '🌩️' }, { name: 'Vercel', icon: '▲' }, { name: 'Git', icon: '🔀' }, { name: 'GitHub', icon: '🐙' }, { name: 'Linux', icon: '🐧' },
    ]},
  ]

  const techColorMap = {
    cyan: { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:shadow-cyan-500/10', dot: 'bg-cyan-400', bar: 'from-cyan-500 to-blue-500' },
    violet: { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20 hover:border-violet-400/60 hover:bg-violet-500/20 hover:shadow-violet-500/10', dot: 'bg-violet-400', bar: 'from-violet-500 to-purple-500' },
    emerald: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:shadow-emerald-500/10', dot: 'bg-emerald-400', bar: 'from-emerald-500 to-teal-500' },
    orange: { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:border-orange-400/60 hover:bg-orange-500/20 hover:shadow-orange-500/10', dot: 'bg-orange-400', bar: 'from-orange-500 to-amber-500' },
  }

  const traits = [
    { icon: '⚡', title: 'Problem Solver', desc: 'Love tackling complex challenges with elegant solutions' },
    { icon: '🚀', title: 'Fast Learner', desc: 'Quickly adapt to new technologies and frameworks' },
    { icon: '🤝', title: 'Team Player', desc: 'Collaborate effectively in agile environments' },
  ]

  return (
    <section id="about" className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="About Me" subtitle="Passionate about building technology that makes a difference" />
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <AnimatedSection>
            <GlowCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-slate-500 font-mono text-sm">about.md</span>
              </div>
              <div className="font-mono text-sm leading-relaxed space-y-4">
                <p className="text-slate-300">
                  <span className="text-violet-400">const</span> <span className="text-cyan-400">developer</span> = {'{'}
                </p>
                <div className="pl-4 space-y-2">
                  <p><span className="text-emerald-400">name</span>: <span className="text-amber-300">&quot;Raghuram Srikanth&quot;</span>,</p>
                  <p><span className="text-emerald-400">education</span>: <span className="text-amber-300">&quot;B.Tech CSE @ SRM IST (2022-2026)&quot;</span>,</p>
                  <p><span className="text-emerald-400">cgpa</span>: <span className="text-cyan-300">9.13</span>,</p>
                  <p><span className="text-emerald-400">passion</span>: [<span className="text-amber-300">&quot;Full Stack Development&quot;</span>, <span className="text-amber-300">&quot;Embedded-System Programming&quot;</span>, <span className="text-amber-300">&quot;App Development&quot;</span>],</p>
                  <p><span className="text-emerald-400">location</span>: <span className="text-amber-300">&quot;Chennai, India&quot;</span></p>
                </div>
                <p className="text-slate-300">{'}'}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/[0.05]">
                <p className="text-slate-400 leading-relaxed text-sm">
                  I&apos;m Raghuram Srikanth, a Computer Science and Engineering student at SRM IST, passionate about
                  full stack development, embedded-system programming, and app development. I enjoy solving real-time
                  problems with technology and building applications that create meaningful impact.
                </p>
              </div>
            </GlowCard>
          </AnimatedSection>

          <div className="space-y-8">
            <AnimatedSection delay={0.2}>
              <GlowCard glowColor="violet" className="p-8">
                <h3 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
                  <span className="text-cyan-400 font-mono text-sm">&lt;/&gt;</span> Tech Arsenal
                </h3>
                <p className="text-xs text-slate-500 mb-6 font-mono">{'// technologies I work with'}</p>
                <div className="space-y-6">
                  {techCategories.map((cat, i) => {
                    const tc = techColorMap[cat.color]
                    return (
                      <div key={i}>
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className={`w-2 h-2 rounded-full ${tc.dot} animate-pulse-glow`} />
                          <span className="text-sm font-bold text-slate-300 tracking-wide">{cat.icon} {cat.category}</span>
                          <div className={`flex-1 h-px bg-gradient-to-r ${tc.bar} opacity-20`} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((item, j) => (
                            <motion.span
                              key={j}
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              whileInView={{ opacity: 1, scale: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.06 + j * 0.04, type: 'spring', stiffness: 200 }}
                              whileHover={{ scale: 1.12, y: -3 }}
                              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm hover:shadow-md transition-all duration-300 cursor-default ${tc.badge}`}
                            >
                              <span className="text-sm group-hover:scale-110 transition-transform">{item.icon}</span>
                              {item.name}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </GlowCard>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-3 gap-4">
                {traits.map((trait, i) => (
                  <motion.div key={i} variants={scaleIn}>
                    <GlowCard glowColor={['cyan', 'violet', 'emerald'][i]} className="p-4 text-center">
                      <div className="text-2xl mb-2">{trait.icon}</div>
                      <h4 className="text-sm font-bold text-slate-200 mb-1">{trait.title}</h4>
                      <p className="text-xs text-slate-500">{trait.desc}</p>
                    </GlowCard>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Education Section ───────────────────────────────────────────
const Education = () => {
  const educationData = [
    {
      level: 'Undergraduate', degree: 'B.Tech in Computer Science and Engineering',
      institution: 'SRM Institute of Science and Technology', location: 'Kattankulathur, Chennai',
      duration: '2022 - 2026', grade: '9.13', gradeLabel: 'CGPA',
      logoUrl: '/srm-logo.png', logoPlaceholder: 'SRM', color: 'cyan',
    },
    {
      level: 'Higher Secondary', degree: 'Class XII (Science Stream - State Board)',
      institution: 'AMM School', location: 'Chennai, Tamil Nadu',
      duration: '2022', grade: '79%', gradeLabel: 'Percentage',
      logoUrl: '/amm-logo.jpeg', logoPlaceholder: 'XII', color: 'emerald',
    },
    {
      level: 'Secondary', degree: 'Class X (State Board)',
      institution: 'AMM School', location: 'Chennai, Tamil Nadu',
      duration: '2020', grade: '72%', gradeLabel: 'Percentage',
      logoUrl: '/amm-logo.jpeg', logoPlaceholder: 'X', color: 'violet',
    },
  ]

  const colorMap = {
    cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500', text: 'text-cyan-400', gradient: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/20' },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500', text: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
    violet: { border: 'border-violet-500/30', bg: 'bg-violet-500', text: 'text-violet-400', gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/20' },
  }

  return (
    <section id="education" className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="Education" subtitle="Academic journey and qualifications" />
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-violet-500/50 to-emerald-500/50 hidden md:block" />
          <div className="space-y-12">
            {educationData.map((edu, index) => {
              const c = colorMap[edu.color]
              return (
                <AnimatedSection key={index} delay={index * 0.15}>
                  <div className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 z-10">
                      <motion.div whileInView={{ scale: [0, 1.2, 1] }} viewport={{ once: true }}
                        className={`w-5 h-5 rounded-full ${c.bg} shadow-lg ${c.glow}`} />
                    </div>
                    <div className="w-full md:w-[calc(50%-2rem)]">
                      <GlowCard glowColor={edu.color} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${c.gradient} p-[2px] flex-shrink-0`}>
                            <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden p-2">
                              <Image src={edu.logoUrl} alt={edu.institution} width={48} height={48} className="w-full h-full object-contain"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
                              <div className="w-full h-full rounded-lg bg-slate-800 flex items-center justify-center" style={{ display: 'none' }}>
                                <span className="text-xs font-bold text-slate-400">{edu.logoPlaceholder}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${c.text} border ${c.border} bg-slate-800/50 mb-2`}>
                              {edu.level}
                            </span>
                            <h3 className="text-base font-bold text-slate-200 leading-tight">{edu.degree}</h3>
                            <p className={`text-sm font-medium ${c.text} mt-1`}>{edu.institution}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>{edu.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>{edu.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`mt-4 rounded-xl bg-gradient-to-r ${c.gradient} p-[1px]`}>
                          <div className="rounded-xl bg-slate-900/90 px-4 py-3 flex items-center justify-between">
                            <span className="text-slate-400 text-sm">{edu.gradeLabel}</span>
                            <span className={`text-2xl font-bold font-mono ${c.text}`}>{edu.grade}</span>
                          </div>
                        </div>
                      </GlowCard>
                    </div>
                    <div className="hidden md:block w-[calc(50%-2rem)]" />
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Experience Section ──────────────────────────────────────────
const Experience = () => {
  const experienceData = [
    {
      title: 'Project Intern', company: 'Tata Consultancy Services', mode: 'On-site',
      duration: 'June 2025 - August 2025', location: 'TCS Siruseri',
      description: [
        'Worked on full-stack development projects using React and Node.js',
        'Created a Task Management System for internal use',
        'Collaborated with teammates to enhance application performance and user experience',
      ],
      technologies: ['React.js', 'MongoDB', 'Express.js', 'UI/UX', 'GitHub'],
      logoUrl: '/tcs-logo.png', logoPlaceholder: 'TCS', color: 'cyan',
    },
    {
      title: 'Data and Automation Intern', company: 'Sesheng', mode: 'Remote',
      duration: 'May 2025 - July 2025', location: 'Remote',
      description: [
        'Learned data gathering and analysis for NoSQL databases',
        'Helped in database and schema design and selection',
        'Collaborated with senior developers on Application Tracking System (ATS) project development',
      ],
      technologies: ['MongoDB', 'SQL', 'Database Design'],
      logoUrl: '/Sesheng-Logo.png', logoPlaceholder: 'SE', color: 'emerald',
    },
    {
      title: 'Web Development Intern', company: 'Gevinst Technologies', mode: 'On-site',
      duration: 'May 2024 - July 2024', location: 'Chennai, India',
      description: [
        'Learned Bootstrap, JavaScript, basics of React, and back-end fundamentals',
        'Created internal tools and helped improve UI/UX components',
        'Collaborated with senior developers on multiple client projects',
      ],
      technologies: ['Bootstrap', 'JavaScript', 'React', 'UI/UX'],
      logoUrl: '/gevinst-logo.png', logoPlaceholder: 'GT', color: 'violet',
    },
    {
      title: 'Community Connect', company: 'Beyond Pages Trust', mode: 'Hybrid',
      duration: 'June 2024 - July 2024', location: 'Chennai, India',
      description: [
        'Participated in community service and development initiatives',
        'Involved in outreach activities and organizing events',
        'Worked collaboratively to implement meaningful social projects',
      ],
      technologies: ['Community Engagement', 'Social Development', 'Team Collaboration'],
      logoUrl: '/Beyond-Pages-Trust.jpeg', logoPlaceholder: 'BPT', color: 'orange',
    },
  ]

  const colorMap = {
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  }

  return (
    <section id="experience" className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Experience" subtitle="Professional journey and internships" />
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          className="grid lg:grid-cols-2 gap-6">
          {experienceData.map((exp, index) => {
            const c = colorMap[exp.color]
            return (
              <motion.div key={index} variants={fadeUp}>
                <GlowCard glowColor={exp.color} className="p-6 h-full card-shine">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-white border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                      <Image src={exp.logoUrl} alt={exp.company} width={56} height={56} className="w-full h-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
                      <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                        <span className="text-xs font-bold text-slate-400">{exp.logoPlaceholder}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-200">{exp.title}</h3>
                      <p className={`text-sm font-medium ${c.text}`}>{exp.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>{exp.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>{exp.location}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${c.badge}`}>{exp.mode}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {exp.description.map((desc, i) => (
                      <p key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.text} bg-current mt-1.5 flex-shrink-0`} />
                        {desc}
                      </p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/50 text-slate-400 border border-white/[0.05]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </GlowCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Projects Section ────────────────────────────────────────────
const Projects = () => {
  const projectData = {
    'Undergraduate Projects': [
      {
        title: 'Embedded ML for Early Detection of Heart Attack Symptoms',
        desc: 'A real-time, offline health monitoring system using biomedical sensors and a lightweight ML model deployed on Arduino Nano 33 BLE Sense Rev2 to detect early signs of heart attacks in vehicle drivers.',
        tech: ['Embedded ML', 'Arduino Nano 33 BLE Sense', 'TensorFlow Lite', 'Biomedical Sensors', 'C++'],
        icon: '❤️‍🩹',
        githubLink: 'https://github.com/IoT-Health-Monitoring-Devices-in-EV/Embedded-Machine-Learning-for-Early-Detection-of-Heart-Attack-Symptoms.git',
      },
      {
        title: 'Integration of IoT Health Monitoring Devices in Automotive Vehicles',
        desc: 'A vehicle-integrated health monitoring system that detects cardiac risk in drivers using edge ML and IoT. Captures real-time vitals (HR, SpO₂, temperature, GSR) via biomedical sensors, runs TensorFlow Lite inference on-device for instant risk classification, and transmits emergency alerts with GPS coordinates over 4G LTE to a Supabase cloud backend. Includes a React Native mobile app (VitalFlow) for live dashboards and a PWM vibration motor for active driver alerting.',
        tech: ['TensorFlow Lite', 'Arduino Nano 33 BLE', 'Nano ESP32', 'A7670E LTE/GNSS', 'Supabase', 'React Native', 'UART', 'Embedded C++'],
        icon: '🚗',
        githubLink: 'https://github.com/IoT-Health-Monitoring-Devices-in-EV/Integrating-IoT-Health-Monitoring-Devices-in-EV.git',
      },
    ],
    'Course & Skill Development Projects': [
      {
        title: 'Smart Tourism Guide',
        desc: 'An intelligent tourism platform leveraging Semantic Web technologies (XML, RDF, OWL ontologies) to deliver context-aware destination discovery across India. Features RDF-based knowledge graphs for smart recommendations, Supabase authentication with favorites system, and responsive UI with SSR.',
        tech: ['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'XML', 'RDF', 'Semantic Web', 'Vercel'],
        icon: '🌍',
        githubLink: 'https://github.com/raghu-ram1104/Smart-Tourist-Guide.git',
      },
      {
        title: 'QuickFix',
        desc: 'A web-based platform connecting users with local repair technicians and DIY experts for instant or same-day repair services. Promotes sustainability by encouraging repairs over replacements.',
        tech: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Agile (Scrum)'],
        icon: '🛠️',
        githubLink: 'https://github.com/hanish-rishen/QuickFix.git',
      },
      {
        title: 'React.js E-commerce',
        desc: 'A fully functional e-commerce web application built with React.js, featuring product browsing, shopping cart, and checkout functionalities.',
        tech: ['React.js', 'Redux', 'React Router', 'Axios', 'Sass', 'Bootstrap'],
        icon: '🛒',
        githubLink: 'https://github.com/raghu-ram1104/ReactJS_Ecommerce.git',
      },
      {
        title: 'Robotic Arm using ESP32',
        desc: 'WiFi-enabled robotic arm controlled via ESP32, demonstrating IoT integration, real-time motor control, and hardware-software interaction.',
        tech: ['ESP32', 'Arduino IDE', 'IoT', 'Embedded C'],
        icon: '🤖',
        githubLink: 'https://github.com/raghu-ram1104/Robotic-Arm-ESP32.git',
      }
    ],
  }

  return (
    <section id="projects" className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Projects" subtitle="Things I've built and contributed to" />
        {Object.entries(projectData).map(([section, projects], idx) => (
          <div key={idx} className="mb-16">
            <AnimatedSection>
              <h3 className="text-xl font-bold text-center mb-8 text-slate-300 font-mono">
                <span className="text-cyan-400">{'{'}</span> {section} <span className="text-cyan-400">{'}'}</span>
              </h3>
            </AnimatedSection>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
              className="grid lg:grid-cols-2 gap-8">
              {projects.map((proj, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlowCard className="p-8 h-full group">
                    <div className="flex items-start gap-4">
                      <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="text-4xl flex-shrink-0">
                        {proj.icon}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-slate-200 mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                          {proj.title}
                        </h4>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">{proj.desc}</p>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {proj.tech.map((techItem, techIdx) => (
                            <span key={techIdx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/5 text-cyan-400 border border-cyan-500/10">
                              {techItem}
                            </span>
                          ))}
                        </div>
                        {proj.githubLink && (
                          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            href={proj.githubLink} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-white/[0.05] hover:border-cyan-500/30 transition-all duration-300 text-sm font-medium">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                            View Repository
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Certifications Section ──────────────────────────────────────
const Certifications = () => {
  const certs = [
    { title: 'Cisco IoT Certificate', org: 'Cisco NetAcad', year: '2024', logoUrl: '/cisco-logo.png', logoPlaceholder: 'CISCO', certificateLink: 'https://drive.google.com/file/d/11Jh9SPyXnX2h_7qCpAAY-lfoWCBNiuE2/view?usp=drive_link', color: 'cyan' },
    { title: 'Cisco Networking Certificate', org: 'Cisco NetAcad', year: '2024', logoUrl: '/cisco-logo.png', logoPlaceholder: 'CISCO', certificateLink: 'https://drive.google.com/file/d/1SH4sQFY1rmfTgge5sBaN5o92dz-xkGoY/view?usp=sharing', color: 'cyan' },
    { title: 'Coursera DBMS Certificate', org: 'Coursera', year: '2024', logoUrl: '/Coursera-Logo.png', logoPlaceholder: 'COURSERA', certificateLink: 'https://drive.google.com/file/d/14d22egpw8fxDRotmTyzj26nU62PK3p0q/view?usp=sharing', color: 'violet' },
    { title: 'Google Cloud Computing Foundations', org: 'Google Cloud', year: '2025', logoUrl: '/google-cloud.png', logoPlaceholder: 'GCP', certificateLink: 'https://drive.google.com/file/d/1RkYuPzHInqejkkkaQGzvlsOrEU5E10KK/view?usp=sharing', color: 'emerald' },
    { title: 'Programming In Java', org: 'NPTEL', year: '2023', logoUrl: '/nptel-logo.png', logoPlaceholder: 'NPTEL', certificateLink: 'https://drive.google.com/file/d/1Iag6cRqa0Ug9jaYGCNLIibkeSO0hXFrW/view?usp=sharing', color: 'orange' },
  ]

  const colorMap = {
    cyan: { gradient: 'from-cyan-500 to-blue-500', text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10' },
    violet: { gradient: 'from-violet-500 to-purple-500', text: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/10' },
    emerald: { gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
    orange: { gradient: 'from-orange-500 to-red-500', text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/10' },
  }

  return (
    <section id="certifications" className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="Certifications" subtitle="Professional credentials and achievements" />
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert, i) => {
            const c = colorMap[cert.color]
            return (
              <motion.div key={i} variants={scaleIn}>
                <GlowCard glowColor={cert.color} className="p-6 text-center group h-full card-shine">
                  <div className="relative mb-5 inline-block">
                    <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${c.gradient} p-[2px] group-hover:scale-110 transition-transform duration-300`}>
                      <div className="w-full h-full rounded-xl bg-white flex items-center justify-center p-2">
                        <Image src={cert.logoUrl} alt={cert.org} width={48} height={48} className="w-full h-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
                        <div className="w-full h-full rounded-lg bg-slate-800 flex items-center justify-center" style={{ display: 'none' }}>
                          <span className="text-xs font-bold text-slate-400">{cert.logoPlaceholder}</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-200 mb-1 leading-tight group-hover:text-cyan-400 transition-colors duration-300 text-sm">
                    {cert.title}
                  </h4>
                  <p className={`text-xs ${c.text} font-medium mb-1`}>{cert.org}</p>
                  <p className="text-xs text-slate-500 mb-4">{cert.year}</p>
                  <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    href={cert.certificateLink} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.text} ${c.bg} ${c.border} border px-3 py-1.5 rounded-lg hover:brightness-125 transition-all duration-300`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Certificate
                  </motion.a>
                </GlowCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Contact Section ─────────────────────────────────────────────
const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus('idle'), 5000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const inputClass = "w-full bg-slate-900/50 border border-white/[0.08] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 text-sm"

  return (
    <section id="contact" className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="Let's Connect" subtitle="Have a project in mind? Let's build something amazing together" />
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <AnimatedSection>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-200 mb-4">Get in Touch</h3>
                <p className="text-slate-400 leading-relaxed">
                  I&apos;m always open to discussing new opportunities, interesting projects,
                  or just having a chat about technology and innovation.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: '📱', label: 'Phone', value: '+91 8610653380', color: 'cyan' },
                  { icon: '📍', label: 'Location', value: 'Chennai, Tamil Nadu', color: 'violet' },
                  { icon: '📧', label: 'Email', value: 'raghuramsrikanth1104@gmail.com', color: 'emerald' },
                ].map((item, i) => (
                  <GlowCard key={i} glowColor={item.color} className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</p>
                        <p className="text-slate-300 text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </div>
              <div className="flex gap-3">
                {[
                  { href: 'https://www.linkedin.com/in/raghuram-srikanth-0088bb286/', icon: '/linkdln.png', alt: 'LinkedIn', fallback: 'in' },
                  { href: 'https://github.com/raghu-ram1104', alt: 'GitHub', fallback: 'GH', isSvg: true },
                  { href: 'mailto:raghuramsrikanth1104@gmail.com', icon: '/gmail-logo.jpeg', alt: 'Gmail', fallback: '@' },
                ].map((social, i) => (
                  <motion.a key={i} whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    href={social.href} target={social.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={social.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    className="w-11 h-11 rounded-xl bg-slate-800/50 border border-white/[0.05] hover:border-cyan-500/30 flex items-center justify-center transition-all duration-300">
                    {social.isSvg ? (
                      <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    ) : (
                      <>
                        <Image src={social.icon} alt={social.alt} width={20} height={20}
                          className="w-5 h-5"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block' }} />
                        <span className="text-xs font-medium text-cyan-400" style={{ display: 'none' }}>{social.fallback}</span>
                      </>
                    )}
                  </motion.a>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <GlowCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-slate-500 font-mono text-sm">contact.form</span>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-mono">name *</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required
                      className={inputClass} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-mono">email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      className={inputClass} placeholder="john@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono">subject *</label>
                  <input type="text" name="subject" value={form.subject} onChange={handleChange} required
                    className={inputClass} placeholder="Project collaboration" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-mono">message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                    className={inputClass + ' resize-none'} placeholder="Tell me about your project..." />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={status === 'sending'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm">
                  {status === 'sending' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Sending...
                    </span>
                  ) : 'Send Message →'}
                </motion.button>
                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
                      Message sent successfully! I&apos;ll get back to you soon.
                    </motion.div>
                  )}
                  {status === 'error' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                      {errorMsg || 'Failed to send message. Please try again.'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </GlowCard>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────
const Footer = () => (
  <footer className="relative border-t border-white/[0.05] py-12 px-6">
    <div className="max-w-6xl mx-auto text-center">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="space-y-4">
        <p className="font-mono text-sm text-slate-500">
          <span className="text-cyan-400">&lt;</span>
          Built with <span className="text-violet-400">Next.js</span> &amp; <span className="text-cyan-400">Tailwind CSS</span>
          <span className="text-cyan-400"> /&gt;</span>
        </p>
        <div className="flex justify-center gap-4 mt-2">
          {[
            { href: 'https://www.linkedin.com/in/raghuram-srikanth-0088bb286/', label: 'LinkedIn', svg: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
            { href: 'https://github.com/raghu-ram1104', label: 'GitHub', svg: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> },
            { href: 'mailto:raghuramsrikanth1104@gmail.com', label: 'Gmail', svg: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg> },
          ].map((s, i) => (
            <motion.a key={i} whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.95 }}
              href={s.href} target={s.href.startsWith('mailto') ? undefined : '_blank'}
              rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              aria-label={s.label}
              className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/[0.08] hover:border-cyan-500/30 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all duration-300">
              {s.svg}
            </motion.a>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-4">&copy; {new Date().getFullYear()} Raghuram. All rights reserved.</p>
        <div className="flex justify-center gap-6 text-xs text-slate-600 mt-2">
          {['About', 'Projects', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-cyan-400 transition-colors">{item}</a>
          ))}
        </div>
      </motion.div>
    </div>
  </footer>
)

// ─── Main Homepage ───────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="font-sans scroll-smooth relative grid-bg noise-overlay">
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <About />
        <Education />
        <Experience />
        <Projects />
        <Certifications />
        <Contact />
        <Footer />
      </div>
    </div>
  )
}
