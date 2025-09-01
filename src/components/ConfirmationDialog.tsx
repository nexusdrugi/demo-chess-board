import React, { useEffect, useRef, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { ConfirmationDialogProps } from '../types/ui'

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null)
  const prevFocused = useRef<HTMLElement | null>(null)

  // Store handlers in refs to avoid re-subscribing effect when parent re-renders
  const onConfirmRef = useRef(onConfirm)
  const onCancelRef = useRef(onCancel)
  useEffect(() => { onConfirmRef.current = onConfirm }, [onConfirm])
  useEffect(() => { onCancelRef.current = onCancel }, [onCancel])

  const titleId = useId()
  const descId = useId()

  // SSR-safe mount guard
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Manage enter/exit transitions and render lifecycle
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Allow next paint to apply visibility for transition
      const t = window.setTimeout(() => setVisible(true), 0)
      return () => window.clearTimeout(t)
    } else {
      setVisible(false)
      // Delay unmount for fade-out
      const t = window.setTimeout(() => setShouldRender(false), 200)
      return () => window.clearTimeout(t)
    }
  }, [isOpen])

  // Focus management and key handling
  useEffect(() => {
    if (!isOpen) return
    prevFocused.current = (document.activeElement as HTMLElement) ?? null

    // Focus the confirm button first for immediate action; fallback to dialog
    const t = window.setTimeout(() => {
      if (confirmBtnRef.current) {
        confirmBtnRef.current.focus()
      } else if (dialogRef.current) {
        dialogRef.current.focus()
      }
    }, 0)

    // Prevent background scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancelRef.current?.()
      } else if (e.key === 'Tab') {
        // Simple focus trap between focusable elements within the dialog
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables || focusables.length === 0) return
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'))
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      // Restore focus
      if (prevFocused.current) prevFocused.current.focus()
    }
  }, [isOpen])

  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === overlayRef.current) {
      onCancelRef.current?.()
    }
  }

  if (!mounted || !shouldRender) return null

  const dialog = (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={`w-full max-w-md rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transform transition-all duration-200 focus:outline-none ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onMouseDown={(e) => {
          // Prevent closing when clicking inside the dialog content
          e.stopPropagation()
        }}
      >
        <div className="px-6 pt-6 pb-4">
          <h3 id={titleId} className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p id={descId} className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => onCancelRef.current?.()}
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => onConfirmRef.current?.()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

export default ConfirmationDialog
