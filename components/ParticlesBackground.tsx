"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  radius: number
  dx: number
  dy: number
  color: string
}

type Props = {
  count?: number
  className?: string
}

const COLORS = ["#10B981", "#34D399", "#FBBF24", "#F87171"]

export default function ParticlesBackground({ count = 40, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: null as number | null, y: null as number | null })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    let particles: Particle[] = []

    function initParticles() {
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 1,
          dx: (Math.random() - 0.5) * 1,
          dy: (Math.random() - 0.5) * 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        })
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height)

      for (let p of particles) {
        // Mouse interaction
        if (mouse.current.x && mouse.current.y) {
          const dx = p.x - mouse.current.x
          const dy = p.y - mouse.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            const angle = Math.atan2(dy, dx)
            const force = (100 - dist) / 100
            p.dx += Math.cos(angle) * force
            p.dy += Math.sin(angle) * force
          }
        }

        // Update positions
        p.x += p.dx
        p.y += p.dy

        // Slow down motion
        p.dx *= 0.95
        p.dy *= 0.95

        // Wrap around edges
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fill()
      }

      requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    function handleResize() {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      initParticles()
    }

    function handleMouseMove(e: MouseEvent) {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed top-0 left-0 w-full h-full ${className}`}
    />
  )
}
