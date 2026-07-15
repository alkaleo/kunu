import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useKunuStore } from '../../store/useKunuStore'
import { WorldViewToggle } from './WorldViewToggle'

describe('WorldViewToggle', () => {
  beforeEach(() => useKunuStore.setState({ worldView: 'globe' }))

  it('switches between globe and map', () => {
    render(<WorldViewToggle/>)
    fireEvent.click(screen.getByRole('button', { name: 'Map' }))
    expect(useKunuStore.getState().worldView).toBe('map')
    expect(screen.getByRole('button', { name: 'Map' })).toHaveAttribute('aria-pressed', 'true')
  })
})
