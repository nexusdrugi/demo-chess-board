import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'
import { vi } from 'vitest'

function Bomb() {
  throw new Error('Boom')
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when child throws and calls onReset', () => {
    const onReset = vi.fn()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary onReset={onReset}>
        <Bomb />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Reset/i }))
    expect(onReset).toHaveBeenCalledTimes(1)

    errorSpy.mockRestore()
  })
})
