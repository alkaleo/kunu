import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'glass'
  icon?: IconName
  children: ReactNode
}

export function Button({ variant = 'primary', icon, children, className = '', ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 450, damping: 24 }}
      className={`button button--${variant} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {icon && <Icon name={icon} width="18" height="18" />}
    </motion.button>
  )
}
