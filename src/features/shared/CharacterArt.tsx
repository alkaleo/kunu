import { useGeneratedCharacter } from '../../hooks/useGeneratedCharacter'

export function CharacterArt({ className = '', variant = 'portrait', fallback = '/assets/characters/clara-age-7.svg', alt = "Clara's Kunu Block character" }: { className?: string; variant?: 'portrait' | 'full-body' | 'sheet'; fallback?: string; alt?: string }) {
  const { sheetUrl, spriteUrl } = useGeneratedCharacter()
  const source = variant === 'full-body' ? spriteUrl : sheetUrl
  return <span className={`character-art character-art--${variant} ${source ? 'is-generated' : 'is-fallback'} ${className}`}><img src={source ?? fallback} alt={alt}/></span>
}
