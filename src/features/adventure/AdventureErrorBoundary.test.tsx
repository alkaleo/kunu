import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialSnapshot, useKunuStore } from '../../store/useKunuStore'
import { AdventureErrorBoundary } from './AdventureErrorBoundary'

function BrokenAdventure(): never { throw new Error('WebGL renderer exploded') }

describe('AdventureErrorBoundary', () => {
  beforeEach(() => useKunuStore.setState({ ...createInitialSnapshot(), hydrated: true, experienceMode: 'adventure' }))

  it('contains an adventure render crash and exposes every recovery action', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(<AdventureErrorBoundary resetKey="adventure"><BrokenAdventure/></AdventureErrorBoundary>)

    expect(screen.getByTestId('adventure-error-fallback')).toBeInTheDocument()
    expect(screen.getByText(/WebGL renderer exploded/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear local Kunu data' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Return to World' })).toBeInTheDocument()
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
