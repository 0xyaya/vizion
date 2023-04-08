import { Component } from 'react'

type ModalProps = {
  isVisible: boolean
  onClose: () => void
  children: JSX.Element
}
const Modal = ({ isVisible, onClose, children }: ModalProps) => {
  if (!isVisible) return null

  const closeHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!event) return
    if (event.currentTarget.id === 'wrapper') onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black flex justify-center items-center bg-opacity-25 backdrop-blur-sm"
      id="wrapper">
      <div className="md:w-[1000px] w-[90%] flex flex-col">
        <button className="text-white text-xl place-self-end" onClick={() => onClose()}>
          X
        </button>
        <div className="ounded">{children}</div>
      </div>
    </div>
  )
}

export default Modal
