import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

function Boom() {
  throw new Error('Crash!')
}

describe('ErrorBoundary custom fallback', () => {
  it('renders provided fallback UI instead of default content', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Custom Fallback</div>}>
        <Boom />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('fallback')).toBeInTheDocument()
    // Ensure default text "Something went wrong." is not shown
    const defaults = screen.queryByText(/Something went wrong\./i)
    expect(defaults).toBeNull()
  })
})
