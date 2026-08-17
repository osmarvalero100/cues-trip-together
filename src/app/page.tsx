import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, CalendarDays, ArrowRight, Tent } from "lucide-react"
import { createParche, joinParche } from "@/lib/actions"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-5xl">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-full mb-4 shadow-lg shadow-indigo-200">
            <Tent className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Trip<span className="text-indigo-600">Together</span> Colombia 🇨🇴
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Organiza el paseo de olla, el puente festivo o la finca con tus amigos sin enredos. 
            Cuentas claras, itinerario y cero excusas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start max-w-4xl mx-auto">
          {/* Formularios */}
          <Card className="shadow-xl border-0 overflow-hidden sm:rounded-2xl bg-white/80 backdrop-blur-sm">
            <Tabs defaultValue="crear" className="w-full">
              <div className="px-6 pt-6 pb-2">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-xl relative z-10">
                  <TabsTrigger value="crear" className="rounded-lg text-sm sm:text-base whitespace-normal py-3 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 leading-tight select-none">
                    <span className="pointer-events-none">Armar el Parche</span>
                  </TabsTrigger>
                  <TabsTrigger value="unirse" className="rounded-lg text-sm sm:text-base whitespace-normal py-3 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 leading-tight select-none">
                    <span className="pointer-events-none">Unirse al Parche</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="crear" className="m-0">
                <CardHeader>
                  <CardTitle>Crea un nuevo plan</CardTitle>
                  <CardDescription>
                    Define el tipo de parche y obtén un código para invitar a los demás.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={createParche} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="title">¿Para dónde vamos o qué hay pa' hacer?</Label>
                      <Input id="title" name="title" placeholder="Ej: Paseo a Melgar, Asado en la finca..." required className="h-12 bg-slate-50" />
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Tipo de Parche</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Label htmlFor="type-express" className="cursor-pointer">
                          <input type="radio" id="type-express" name="type" value="EXPRESS" className="peer sr-only" defaultChecked />
                          <div className="rounded-xl border-2 border-slate-200 p-4 hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 transition-all text-center">
                            <CalendarDays className="w-6 h-6 mx-auto mb-2 opacity-70" />
                            <div className="font-bold text-sm">Plan Express</div>
                            <div className="text-xs opacity-70 mt-1">Un solo día</div>
                          </div>
                        </Label>
                        <Label htmlFor="type-multinight" className="cursor-pointer">
                          <input type="radio" id="type-multinight" name="type" value="MULTINIGHT" className="peer sr-only" />
                          <div className="rounded-xl border-2 border-slate-200 p-4 hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 transition-all text-center">
                            <MapPin className="w-6 h-6 mx-auto mb-2 opacity-70" />
                            <div className="font-bold text-sm">Viaje Multinoche</div>
                            <div className="text-xs opacity-70 mt-1">Varios días</div>
                          </div>
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label htmlFor="nickname">¿Cómo te dicen?</Label>
                      <Input id="nickname" name="nickname" placeholder="Tu apodo en el grupo" required className="h-12 bg-slate-50" />
                    </div>

                    <SubmitButton loadingText="Creando..." className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md">
                      Crear Parche <ArrowRight className="w-4 h-4 ml-2" />
                    </SubmitButton>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="unirse" className="m-0">
                <CardHeader>
                  <CardTitle>¿Ya te invitaron?</CardTitle>
                  <CardDescription>
                    Ingresa el código que te pasaron por WhatsApp para entrar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={joinParche} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código del Parche</Label>
                      <Input id="code" name="code" placeholder="PARCHE-123" required className="h-12 uppercase bg-slate-50 font-mono tracking-widest text-lg" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="join-nickname">¿Cómo te dicen?</Label>
                      <Input id="join-nickname" name="nickname" placeholder="Tu apodo" required className="h-12 bg-slate-50" />
                    </div>

                    <SubmitButton loadingText="Entrando..." className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 shadow-md">
                      Entrar al Parche <Users className="w-4 h-4 ml-2" />
                    </SubmitButton>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Características */}
          <div className="space-y-8 lg:mt-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Votaciones Cero Estrés</h3>
                <p className="text-slate-600 leading-relaxed">
                  ¿Nadie se decide a dónde ir? Propongan lugares, voten y que gane la mejor opción. Se acabó la peleadera en el grupo.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <span className="text-2xl font-bold">$</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Cuentas Claras</h3>
                <p className="text-slate-600 leading-relaxed">
                  Registren quién pagó qué. La app calcula quién le debe a quién automáticamente. Saldar la deuda por Nequi es a un clic.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">¿Quién lleva qué?</h3>
                <p className="text-slate-600 leading-relaxed">
                  El que pone la casa, el que lleva el bafle, el que compra la carne. Todo organizado en un solo lugar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
