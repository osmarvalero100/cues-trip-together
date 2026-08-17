import { registerUser } from '@/lib/auth.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/submit-button'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold text-slate-900">Crear Cuenta</CardTitle>
          <CardDescription>
            Guarda el historial de todos tus parches. Si ya tenías parches en este dispositivo, se vincularán automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={registerUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">¿Cómo te dicen?</Label>
              <Input id="nickname" name="nickname" placeholder="Tu apodo" required className="h-12 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" required className="h-12 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-12 bg-slate-50" minLength={6} />
            </div>
            
            <SubmitButton loadingText="Registrando..." className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-semibold text-base">
              Crear mi cuenta
            </SubmitButton>

            <p className="text-center text-sm text-slate-600 mt-4">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
