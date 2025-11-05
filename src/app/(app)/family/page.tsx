'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Check, Plus } from "lucide-react"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


const connectionTasks = [
    { title: 'Leer un libro juntos', completed: true },
    { title: 'Salir al parque sin móviles', completed: false },
    { title: 'Enseñar algo nuevo (ej: una habilidad)', completed: false },
    { title: 'Cocinar juntos una comida', completed: false },
];

const familyTips = [
    "Un líder guía con el ejemplo, no con la fuerza.",
    "La vulnerabilidad es una fortaleza, no una debilidad. Muéstrale a tu hijo que está bien sentir.",
    "Tu presencia es el mejor regalo que puedes ofrecer.",
    "Escucha para entender, no solo para responder."
];

export default function FamilyPage() {
    const [tip, setTip] = React.useState('');

    React.useEffect(() => {
        setTip(familyTips[Math.floor(Math.random() * familyTips.length)]);
    }, []);

    return (
        <div className="grid gap-8">
             <div className="text-center">
                <h1 className="text-4xl font-headline tracking-tight text-primary">ESPACIO PADRE-HIJO</h1>
                <p className="text-muted-foreground mt-2">Lidera tu familia con propósito y presencia.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Agenda de Conexión</CardTitle>
                        <CardDescription>Planifica tiempo de calidad intencional.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <p className="font-semibold">Noche de juegos</p>
                                <p className="text-sm text-muted-foreground">Este viernes a las 7:00 PM</p>
                            </div>
                            <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" />Reprogramar</Button>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full font-bold"><Plus className="h-4 w-4 mr-2" />Agendar Nuevo Momento</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                <DialogTitle>Agendar Tiempo de Calidad</DialogTitle>
                                <DialogDescription>
                                    Crea un nuevo espacio en tu agenda para conectar.
                                </DialogDescription>                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="activity" className="text-right">
                                    Actividad
                                    </Label>
                                    <Input id="activity" placeholder="Ej: Construir un cohete" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="date" className="text-right">
                                    Fecha
                                    </Label>
                                    <Input id="date" type="datetime-local" className="col-span-3" />
                                </div>
                                </div>
                                <DialogFooter>
                                <Button type="submit">Agendar</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Consejo de Liderazgo Familiar</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6 text-center h-full">
                        <p className="text-lg italic text-primary">&ldquo;{tip}&rdquo;</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Tareas de Conexión</CardTitle>
                    <CardDescription>Pequeñas acciones que construyen grandes vínculos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {connectionTasks.map((task, index) => (
                            <div key={index} className={`flex items-center p-3 rounded-md transition-colors ${task.completed ? 'bg-muted' : 'bg-card hover:bg-muted/50'}`}>
                                <Check className={`h-5 w-5 mr-3 shrink-0 ${task.completed ? 'text-[hsl(var(--chart-2))]' : 'text-muted-foreground'}`} />
                                <span className={`${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
                                {!task.completed && <Button variant="ghost" size="sm" className="ml-auto">Completar</Button>}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
