import { useCallback, useEffect, useRef } from 'react'
import { useKunuStore } from '../store/useKunuStore'

type AudioScene = 'home' | 'adventure'
type AudioCue = 'collect' | 'discover' | 'badge'

export function useKunuAudio(scene: AudioScene) {
  const settings = useKunuStore((state) => state.settings)
  const contextRef = useRef<AudioContext | null>(null)
  const sourcesRef = useRef<AudioScheduledSourceNode[]>([])

  const start = useCallback(() => {
    if (!settings.masterAudio || contextRef.current) return contextRef.current
    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return null
    const context = new AudioCtor()
    const master = context.createGain()
    master.gain.value = settings.volume * (settings.reducedSensory ? .32 : .58)
    master.connect(context.destination)

    if (settings.music) {
      const chord = scene === 'home' ? [174.61, 220] : [196, 293.66]
      chord.forEach((frequency, index) => {
        const oscillator = context.createOscillator(); const gain = context.createGain()
        oscillator.type = index ? 'sine' : 'triangle'; oscillator.frequency.value = frequency
        gain.gain.value = index ? .018 : .012
        oscillator.connect(gain).connect(master); oscillator.start(); sourcesRef.current.push(oscillator)
      })
    }

    if (settings.ambience) {
      const wind = context.createOscillator(); const filter = context.createBiquadFilter(); const gain = context.createGain()
      wind.type = 'sine'; wind.frequency.value = scene === 'home' ? 62 : 48
      filter.type = 'lowpass'; filter.frequency.value = 110
      gain.gain.value = scene === 'home' ? .007 : .013
      wind.connect(filter).connect(gain).connect(master); wind.start(); sourcesRef.current.push(wind)
    }

    contextRef.current = context
    return context
  }, [scene, settings])

  const playCue = useCallback((cue: AudioCue) => {
    const context = start(); if (!context || !settings.masterAudio) return
    void context.resume()
    const oscillator = context.createOscillator(); const gain = context.createGain()
    const now = context.currentTime
    oscillator.type = cue === 'badge' ? 'triangle' : 'sine'
    oscillator.frequency.setValueAtTime(cue === 'collect' ? 520 : cue === 'discover' ? 392 : 330, now)
    oscillator.frequency.exponentialRampToValueAtTime(cue === 'badge' ? 880 : 740, now + (cue === 'badge' ? .65 : .22))
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(settings.volume * .13, now + .025); gain.gain.exponentialRampToValueAtTime(.0001, now + (cue === 'badge' ? .9 : .34))
    oscillator.connect(gain).connect(context.destination); oscillator.start(now); oscillator.stop(now + (cue === 'badge' ? 1 : .38))
  }, [settings.masterAudio, settings.volume, start])

  useEffect(() => {
    const unlock = () => { const context = start(); if (context?.state === 'suspended') void context.resume() }
    window.addEventListener('pointerdown', unlock, { once: true }); window.addEventListener('keydown', unlock, { once: true })
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); sourcesRef.current.forEach((source) => { try { source.stop() } catch { /* already stopped */ } }); sourcesRef.current = []; const context = contextRef.current; contextRef.current = null; if (context) void context.close() }
  }, [start])

  return { playCue }
}
