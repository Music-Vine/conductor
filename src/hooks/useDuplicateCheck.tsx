'use client'

import { useState, useCallback } from 'react'
import { hashFile } from '@/lib/upload'

interface DuplicateResult {
  isDuplicate: boolean
  existingAssetId?: string
  existingAssetTitle?: string
}

export function useDuplicateCheck() {
  const [checking, setChecking] = useState(false)

  const checkDuplicate = useCallback(async (file: File): Promise<DuplicateResult> => {
    setChecking(true)
    try {
      const hash = await hashFile(file)
      const response = await fetch('/api/assets/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, filename: file.name }),
      })
      if (!response.ok) throw new Error('Duplicate check failed')
      return response.json()
    } finally {
      setChecking(false)
    }
  }, [])

  return { checkDuplicate, checking }
}
