import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
       <div className="text-center">
        <h1 className="text-4xl font-headline tracking-tight text-primary">CONFIGURACIÓN</h1>
        <p className="text-muted-foreground mt-2">Ajusta la herramienta a tu camino.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Actualiza la información de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" defaultValue="Guerrero" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="guerrero@disciplina.com" readOnly/>
          </div>
           <Button>Guardar Cambios</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Activa o desactiva las notificaciones para mantenerte enfocado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="start-day" className="text-base">
                Recordatorio de inicio de día
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe un empujón para empezar tu rutina diaria.
              </p>
            </div>
            <Switch id="start-day" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="end-day" className="text-base">
                Recordatorio de reflexión nocturna
              </Label>
               <p className="text-sm text-muted-foreground">
                Un aviso para registrar tus pensamientos antes de dormir.
              </p>
            </div>
            <Switch id="end-day" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
