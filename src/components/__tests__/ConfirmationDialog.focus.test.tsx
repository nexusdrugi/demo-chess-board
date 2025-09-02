import React, { useState, useRef } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConfirmationDialog from '../ConfirmationDialog'

function Wrapper() {
  const [open, setOpen] = useState(true)
  const beforeBtnRef = useRef<HTMLButtonElement | null>(null)
  return (
    <div>
      <button ref={beforeBtnRef} aria-label="before">Before</button>
      <ConfirmationDialog
        isOpen={open}
        title="Title"
        message="Msg"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
      <button aria-label="after">After</button>
    </div>
  )
}

describe('ConfirmationDialog focus and body scroll handling', () => {
  it('traps focus within dialog and restores body overflow on close', async () => {
    const { rerender } = render(<Wrapper />)

    const confirmBtn = await screen.findByRole('button', { name: /Confirm/i })

    // Body overflow is hidden while open
    await waitFor(() => expect(document.body.style.overflow).toBe('hidden'))

    // Initially confirm has focus
    await waitFor(() => expect(document.activeElement).toBe(confirmBtn))

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })

    // Move focus to last (confirm), press Tab => should wrap to first (cancel)
    confirmBtn.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(cancelBtn)

    // From first with Shift+Tab => should go to last (confirm)
    cancelBtn.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(confirmBtn)

    // Close via Cancel and ensure body overflow restored
    fireEvent.click(cancelBtn)
    await waitFor(() => expect(document.body.style.overflow).toBe(''))
  })
})
