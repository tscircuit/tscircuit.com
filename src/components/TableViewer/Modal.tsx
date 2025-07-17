// Modal.tsx
import type React from "react"

interface ModalProps {
  open: boolean
  children: React.ReactNode
  title: string
  onClose: () => void
}

const Modal: React.FC<ModalProps> = ({ open, children, title, onClose }) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-5 rounded-lg relative w-11/12 max-w-2xl"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <h2 className="mt-0 text-xl">{title}</h2>
        <button
          className="absolute top-4 right-4 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
