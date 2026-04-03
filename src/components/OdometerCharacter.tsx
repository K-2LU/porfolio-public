import { useEffect, useRef, useState } from 'react'

const ALPHABET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const SPINS = 2
const HOVER_SPINS = 20
const MAX_SPINS = 25
const CHAR_HEIGHT = 48

const OdometerCharacter = ({
  character,
  speed = 30,
  className = ''
}: {
  character: string
  speed?: number
  className?: string
}) => {
  const isLetter = ALPHABET.includes(character)
  const targetIndex = isLetter ? ALPHABET.indexOf(character) : 0
  const alphaLen = ALPHABET.length

  // Further from start = faster spin (more slots to cover, less ms per slot)
  // Range: speed ms/slot (index 0) → speed/2 ms/slot (last index)
  const msPerSlot = speed / (1 + targetIndex / alphaLen)

  const strip = [
    ...Array(MAX_SPINS).fill(null).flatMap(() => ALPHABET.split('')),
    ...ALPHABET.slice(0, targetIndex + 1).split(''),
  ]

  const normalFinalY = -((SPINS * alphaLen + targetIndex) * CHAR_HEIGHT)
  const normalDuration = (SPINS * alphaLen + targetIndex) * msPerSlot
  const hoverFinalY = -((HOVER_SPINS * alphaLen) * CHAR_HEIGHT)
  const hoverDuration = HOVER_SPINS * alphaLen * msPerSlot

  const [translateY, setTranslateY] = useState(0)
  const [transition, setTransition] = useState('none')
  const innerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const scheduleTransition = (toY: number, trans: string) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setTransition(trans)
        setTranslateY(toY)
      })
    })
  }

  const getCurrentY = () => {
    if (!innerRef.current) return 0
    const matrix = new DOMMatrix(window.getComputedStyle(innerRef.current).transform)
    return matrix.m42
  }

  const snapAndRun = (toY: number, trans: string) => {
    const currentY = getCurrentY()
    setTransition('none')
    setTranslateY(currentY)
    scheduleTransition(toY, trans)
  }

  // Find the next slot index where target character appears, starting after currentSlot
  const nextTargetY = (fromY: number) => {
    const currentSlot = Math.abs(fromY) / CHAR_HEIGHT
    const round = Math.floor(currentSlot / alphaLen)
    const posInRound = currentSlot % alphaLen
    const nextRound = posInRound <= targetIndex ? round : round + 1
    const slot = Math.min(nextRound * alphaLen + targetIndex, MAX_SPINS * alphaLen + targetIndex)
    return -(slot * CHAR_HEIGHT)
  }

  useEffect(() => {
    if (!isLetter) return
    setTranslateY(0)
    setTransition('none')
    scheduleTransition(normalFinalY, `transform ${normalDuration}ms cubic-bezier(0.25, 0.1, 0.1, 1)`)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [character])

  const handleMouseEnter = () => {
    if (!isLetter) return
    snapAndRun(hoverFinalY, `transform ${hoverDuration}ms linear`)
  }

  const handleMouseLeave = () => {
    if (!isLetter) return
    const currentY = getCurrentY()
    const toY = nextTargetY(currentY)
    const slots = Math.abs(toY - currentY) / CHAR_HEIGHT
    snapAndRun(toY, `transform ${slots * msPerSlot}ms cubic-bezier(0.25, 0.1, 0.1, 1)`)
  }

  if (!isLetter) {
    return (
      <div className={`shadow-inner shadow-[#1A1515]/20 p-[2px] text-4xl h-12 flex items-center ${className}`}>
        {character}
      </div>
    )
  }

  return (
    <div
      className={`shadow-inner shadow-[#1A1515]/20 p-[2px] text-4xl overflow-hidden cursor-default ${className}`}
      style={{ height: CHAR_HEIGHT }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={innerRef}
        style={{ transform: `translateY(${translateY}px)`, transition }}
      >
        {strip.map((letter, i) => (
          <div key={i} style={{ height: CHAR_HEIGHT }} className="flex items-center justify-center">
            {letter}
          </div>
        ))}
      </div>
    </div>
  )
}

export default OdometerCharacter
