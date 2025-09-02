import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConfirmationDialog from '../ConfirmationDialog'
import { vi } from 'vitest'

describe('ConfirmationDialog', () => {
  it('renders when open and calls onConfirm/onCancel', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <ConfirmationDialog
        isOpen
        title="Reset Game?"
        message="Are you sure?"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('closes via Escape and backdrop click; confirm gets focus', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmationDialog
        isOpen
        title="Title"
        message="Msg"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    // Confirm button receives focus after mount
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i })
    await waitFor(() => expect(document.activeElement).toBe(confirmBtn))

    // Escape should cancel
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)

    // Backdrop click cancels
    onCancel.mockClear()
    const overlay = screen.getByRole('dialog').parentElement as HTMLElement
    fireEvent.mouseDown(overlay)
    expect(onCancel).toHaveBeenCalledTimes(1)

    // Click inside dialog should not cancel
    onCancel.mockClear()
    const dialog = screen.getByRole('dialog')
    fireEvent.mouseDown(dialog)
    expect(onCancel).not.toHaveBeenCalled()
  })
})
