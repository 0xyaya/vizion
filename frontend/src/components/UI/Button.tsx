type ButtonProps = {
  label: string
  width?: string
  height?: string
  color?: string
  className?: string
  onClick?: () => void
}

const Button = ({
  label,
  width = 'w-32',
  height = 'h-10',
  color = 'bg-[#00248F] hover:bg-blue-900 hover:border-blue-900',
  className,
  onClick
}: ButtonProps) => {
  const style = `${className} ${width} ${height} ${color} px-4 py-2 rounded-lg  border border-slate-500 text-white duration-150`
  return (
    <button onClick={onClick} className={style}>
      {label}
    </button>
  )
}

export default Button
