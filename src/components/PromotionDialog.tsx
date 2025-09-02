import React, { useEffect, useRef, useState } from 'react'
import type { PieceColor } from '../types/chess'

export interface PromotionDialogProps {
  isOpen: boolean
  color: PieceColor
  onSelect: (piece: 'queen' | 'rook' | 'bishop' | 'knight') => void
  onCancel: () => void
}

const pieceOrder: Array<'queen' | 'rook' | 'bishop' | 'knight'> = ['queen', 'rook', 'bishop', 'knight']

const titleId = 'promotion-dialog-title'

const PromotionDialog: React.FC<PromotionDialogProps> = ({ isOpen, color, onSelect, onCancel }) => {
  const [selected, setSelected] = useState<'queen' | 'rook' | 'bishop' | 'knight'>('queen')
  const firstBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSelected('queen')
      // Focus first button
      firstBtnRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const idx = pieceOrder.indexOf(selected)
      const nextIdx = (idx + (e.key === 'ArrowRight' ? 1 : -1) + pieceOrder.length) % pieceOrder.length
      setSelected(pieceOrder[nextIdx])
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(selected)
    }
  }

  const pieceLabel = (p: string) => `${color === 'white' ? 'White' : 'Black'} ${p}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onKeyDown={handleKeyDown}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-lg shadow-xl p-6 w-80"
      >
        <h2 id={titleId} className="text-lg font-bold mb-4">Promote Pawn</h2>
        <p className="text-sm text-gray-600 mb-3">Choose a piece to promote your pawn to:</p>
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          Promotion prompt open. Choose Queen, Rook, Bishop, or Knight. Press Enter to confirm.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {pieceOrder.map((p, idx) => (
            <button
              key={p}
              ref={idx === 0 ? firstBtnRef : undefined}
              autoFocus={idx === 0}
              className={`border rounded-lg py-2 px-3 text-sm font-semibold transition ${selected === p ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300 hover:border-gray-400'}`}
              onClick={() => onSelect(p)}
              aria-pressed={selected === p}
            >
              {pieceLabel(p.charAt(0).toUpperCase() + p.slice(1))}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded"
          >Cancel</button>
          <button
            onClick={() => onSelect(selected)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded"
          >Confirm</button>
        </div>
      </div>
    </div>
  )
}

export default PromotionDialog
