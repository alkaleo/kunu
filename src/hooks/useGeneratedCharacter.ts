import { useEffect, useState } from 'react'
import { loadLocalPhoto } from '../lib/db'
import { isolateFullBody } from '../lib/character'
import { useKunuStore } from '../store/useKunuStore'

export function useGeneratedCharacter() {
  const imageId = useKunuStore((state) => state.child.characterImageId)
  const [sheetUrl, setSheetUrl] = useState<string>()
  const [spriteUrl, setSpriteUrl] = useState<string>()

  useEffect(() => {
    let active = true
    let sheetObjectUrl = ''
    let spriteObjectUrl = ''
    setSheetUrl(undefined)
    setSpriteUrl(undefined)
    if (!imageId) return
    void loadLocalPhoto(imageId).then(async (sheet) => {
      if (!sheet || !active) return
      sheetObjectUrl = URL.createObjectURL(sheet)
      setSheetUrl(sheetObjectUrl)
      try {
        const sprite = await isolateFullBody(sheet)
        if (!active) return
        spriteObjectUrl = URL.createObjectURL(sprite)
        setSpriteUrl(spriteObjectUrl)
      } catch (error) {
        console.error('[Kunu] Generated character isolation failed; using the procedural fallback.', error)
      }
    }).catch((error) => console.error('[Kunu] Approved character could not be loaded.', error))
    return () => {
      active = false
      if (sheetObjectUrl) URL.revokeObjectURL(sheetObjectUrl)
      if (spriteObjectUrl) URL.revokeObjectURL(spriteObjectUrl)
    }
  }, [imageId])

  return { sheetUrl, spriteUrl, hasGeneratedCharacter: Boolean(imageId && sheetUrl) }
}
