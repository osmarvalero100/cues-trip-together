'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

export function CopyInviteCode({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
    } catch {
      const input = document.createElement('input')
      input.value = inviteCode
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-3xl font-black tracking-widest bg-black/10 rounded-lg p-2">
        {inviteCode}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        className={copied ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-white/20 text-white hover:bg-white/30"}
      >
        {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
        {copied ? 'Copiado' : 'Copiar'}
      </Button>
    </div>
  )
}
