/* Toaster Component - A component that displays a toaster (a component that displays a toast) - from shadcn/ui (exposes Toaster) */
import './sonner.css'
import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast rounded-2xl border p-4 shadow-xl font-sans',
          default:
            'border-[#136b77]/20 bg-[#136b77] text-white shadow-[#136b77]/25 [&_[data-close-button]]:text-[#b89535] [&_[data-description]]:text-white/90',
          success:
            'border-[#136b77]/30 bg-[#136b77] text-white shadow-[#136b77]/30 [&_[data-close-button]]:text-[#b89535] [&_[data-description]]:text-white/90',
          info: 'border-[#e2d5c3] bg-[#fdf8f1] text-[#2c3e44] shadow-[#8d775f]/15 [&_[data-close-button]]:text-[#8b6914] [&_[data-description]]:text-[#3d535b]',
          warning:
            'border-[#e2d5c3] bg-[#fdf8f1] text-[#2c3e44] shadow-[#8d775f]/15 [&_[data-close-button]]:text-[#8b6914] [&_[data-description]]:text-[#3d535b]',
          error:
            'border-rose-700 bg-rose-700 text-white shadow-rose-900/25 [&_[data-close-button]]:text-rose-200 [&_[data-description]]:text-white/90',
          title: 'font-bold text-sm tracking-tight text-inherit',
          description: 'text-xs sm:text-sm font-normal text-inherit opacity-95',
          actionButton: 'group-[.toast]:bg-white group-[.toast]:text-[#136b77] font-semibold',
          cancelButton: 'group-[.toast]:bg-white/20 group-[.toast]:text-white',
          closeButton: 'text-[#b89535] border-none bg-transparent hover:bg-black/5',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
