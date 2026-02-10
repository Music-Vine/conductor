import { guess } from 'web-audio-beat-detector'

/**
 * Detect BPM of audio file using Web Audio API.
 * Returns rounded BPM value.
 *
 * Important: Always closes AudioContext after use to avoid memory leaks
 * and "too many AudioContexts" errors.
 *
 * Note: BPM detection can fail for some audio types (speech, ambient).
 * Caller should handle errors gracefully (BPM is optional for music).
 */
export async function detectBPM(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer()
  const audioContext = new AudioContext()

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const { bpm } = await guess(audioBuffer)
    return Math.round(bpm)
  } finally {
    await audioContext.close()
  }
}

/**
 * Safe BPM detection that returns null instead of throwing.
 * Use this when BPM is optional (prefilling form field).
 */
export async function detectBPMSafe(file: File): Promise<number | null> {
  try {
    return await detectBPM(file)
  } catch (error) {
    console.warn('BPM detection failed:', error)
    return null
  }
}
