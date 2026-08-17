'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PwaInstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // 1. Verificar si la app ya está instalada (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // 2. Verificar si pasó la hora desde la última vez que lo cerró
    const lastDismissed = localStorage.getItem('pwa-banner-dismissed')
    if (lastDismissed) {
      const oneHour = 60 * 60 * 1000
      if (Date.now() - parseInt(lastDismissed, 10) < oneHour) {
        return // Todavía no pasó 1 hora
      }
    }

    // 3. Detectar si es un dispositivo móvil
    const isMobile = window.innerWidth < 1024
    if (!isMobile) return

    // 4. Lógica de PWA para Android (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir el prompt nativo por defecto
      e.preventDefault()
      // Guardar el evento para dispararlo luego
      setDeferredPrompt(e)
      // Mostrar nuestro banner custom
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 5. Lógica para iOS (Safari no dispara beforeinstallprompt)
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIosDevice)
    
    if (isIosDevice) {
      // En iOS mostramos el banner directamente si es móvil
      setShow(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString())
    setShow(false)
  }

  const installPwa = async () => {
    if (deferredPrompt) {
      // Disparar el prompt nativo de Android
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShow(false)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      // Instrucciones manuales para iOS
      alert("Para instalar en iOS:\n\n1. Toca el botón 'Compartir' (el cuadrado con la flecha hacia arriba) en la parte inferior de la pantalla.\n2. Selecciona 'Agregar a Inicio'.")
    }
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 md:pb-4 animate-in slide-in-from-bottom-10 duration-500 fade-in">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 max-w-md mx-auto border border-slate-700">
        <div className="flex-1">
          <p className="font-bold text-sm">Instala TripTogether</p>
          <p className="text-xs text-slate-300 mt-0.5 leading-snug">
            Acceso rápido a tus parches como una app nativa.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={installPwa} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 rounded-xl px-3 font-semibold">
            <Download className="w-4 h-4 mr-1.5" />
            Instalar
          </Button>
          <button onClick={dismiss} className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
