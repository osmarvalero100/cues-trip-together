'use client'

import React from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  loadingText?: string
}

export function SubmitButton({ children, loadingText, className, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className={className}
      {...props}
    >
      {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
      {pending && loadingText ? loadingText : children}
    </Button>
  )
}
