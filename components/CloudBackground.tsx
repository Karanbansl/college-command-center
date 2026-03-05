'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function CloudBackground() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  const isLight = resolvedTheme === 'light'

  if (!isLight) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-100">
      {/* Sun glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-[-10%] right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-yellow-100/40 blur-[100px]"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute top-[5%] right-[15%] w-[15vw] h-[15vw] max-w-[200px] max-h-[200px] rounded-full bg-white blur-[30px]"
      />
      
      {/* Fluffy Clouds */}
      <Cloud top="15%" delay={0} duration={120} opacity={0.9} scale={1.2} />
      <Cloud top="40%" delay={20} duration={150} opacity={0.6} scale={0.8} />
      <Cloud top="60%" delay={45} duration={180} opacity={0.7} scale={1.5} />
      <Cloud top="20%" delay={70} duration={200} opacity={0.5} scale={0.6} />
      <Cloud top="75%" delay={10} duration={140} opacity={0.8} scale={1.1} />
    </div>
  )
}

function Cloud({ top, scale, delay, duration, opacity }: any) {
  return (
    <motion.div
      className="absolute left-[-400px]"
      style={{ top, opacity, filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.04))' }}
      animate={{ x: ['0vw', '150vw'] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
        // Use a negative delay to start the animation partway through for immediate rendering
        delay: -delay,
      }}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <svg width="300" height="150" viewBox="0 0 300 150" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M211.5 60C211.5 35.1472 191.353 15 166.5 15C148.51 15 132.991 25.556 125.433 40.8525C121.05 39.0208 116.182 38 111 38C91.1177 38 75 54.1177 75 74C75 75.2937 75.0683 76.5714 75.1997 77.8285C74.8055 77.7681 74.4055 77.737 74 77.737C55.2223 77.737 40 92.9593 40 111.737C40 130.515 55.2223 145.737 74 145.737H237.5C258.763 145.737 276 128.5 276 107.237C276 86.6669 259.851 69.8647 239.544 68.8041C234.341 62.4042 223.366 60 211.5 60Z" />
        </svg>
      </div>
    </motion.div>
  )
}
