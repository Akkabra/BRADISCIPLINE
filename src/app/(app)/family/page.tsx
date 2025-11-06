'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon, Check, Loader2, Plus } from "lucide-react"
import React, { useEffect, useState } from "react"
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
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { addDoc, collection, doc, serverTimestamp, updateDoc, query, orderBy, limit, deleteDoc } from "firebase/firestore"
import type { WithId } from "@/firebase"
import { format, setHours, setMinutes } from "date-fns"
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type ConnectionTask = {
    title: string;
    completed: boolean;
    createdAt: any;
    userId: string;
};

type FamilyEvent = {
    activity: string;
    date: string;
    createdAt: any;
    userId: string;
};

const initialConnectionTasks = [
    { title: 'Leer un libro juntos', completed: false },
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
    const [tip, setTip] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<WithId<FamilyEvent> | null>(null);

    const { user } = useAuth();
    const firestore = useFirestore();

    const tasksRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/connection_tasks`) : null, [firestore, user]);
    const { data: tasks, isLoading: tasksLoading } = useCollection<ConnectionTask>(tasksRef);
    
    const eventsQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/family_events`), orderBy("date", "desc"), limit(1)) : null, [firestore, user]);
    const { data: events, isLoading: eventsLoading } = useCollection<FamilyEvent>(eventsQuery);
    
    const latestEvent = events?.[0];

    useEffect(() => {
        setTip(familyTips[Math.floor(Math.random() * familyTips.length)]);
    }, []);

    useEffect(() => {
        if (user && !tasksLoading && (!tasks || tasks.length === 0)) {
            const batch = initialConnectionTasks.map(task => 
                addDoc(tasksRef!, {
                    ...task,
                    userId: user.uid,
                    createdAt: serverTimestamp()
                })
            );
            Promise.all(batch);
        }
    }, [user, tasks, tasksLoading, tasksRef]);
    
    const handleToggleTask = async (task: WithId<ConnectionTask>) => {
        if (!user || !task.id) return;
        const taskRef = doc(firestore, `users/${user.uid}/connection_tasks/${task.id}`);
        await updateDoc(taskRef, { completed: !task.completed });
    }
    
    const handleOpenDialog = (event: WithId<FamilyEvent> | null = null) => {
        setEditingEvent(event);
        setIsDialogOpen(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Fecha no definida";
        try {
          return format(new Date(dateString), "eeee, d 'de' MMMM 'a las' HH:mm", { locale: es });
        } catch (error) {
          return "Fecha inválida";
        }
    };

    return (
        <div className="grid gap-8">
             <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-headline tracking-tight text-primary">ESPACIO PADRE-HIJO</h1>
                <p className="text-muted-foreground mt-2">Lidera tu familia con propósito y presencia.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Agenda de Conexión</CardTitle>
                        <CardDescription>Planifica tiempo de calidad intencional.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {eventsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary"/> : (
                           latestEvent ? (
                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted rounded-lg gap-4">
                                <div>
                                    <p className="font-semibold">{latestEvent.activity}</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(latestEvent.date)}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(latestEvent)} className="w-full sm:w-auto"><CalendarIcon className="h-4 w-4 mr-2" />Reprogramar</Button>
                            </div>
                           ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No hay eventos agendados.</p>
                           )
                        )}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full font-bold" onClick={() => handleOpenDialog(null)}><Plus className="h-4 w-4 mr-2" />Agendar Nuevo Momento</Button>
                            </DialogTrigger>
                            <EventDialogContent 
                                user={user}
                                firestore={firestore}
                                event={editingEvent}
                                onFinished={() => setIsDialogOpen(false)}
                            />
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
                    {tasksLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /> : (
                        <div className="space-y-3">
                            {tasks?.sort((a,b) => a.title.localeCompare(b.title)).map((task) => (
                                <div key={task.id} className={`flex items-center p-3 rounded-md transition-colors ${task.completed ? 'bg-muted' : 'bg-card hover:bg-muted/50'}`}>
                                    <button onClick={() => handleToggleTask(task)} className="flex items-center flex-1 text-left">
                                        <Check className={`h-5 w-5 mr-3 shrink-0 ${task.completed ? 'text-[hsl(var(--chart-2))]' : 'text-muted-foreground'}`} />
                                        <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
                                    </button>
                                    {!task.completed && <Button variant="ghost" size="sm" className="ml-auto hidden sm:inline-flex" onClick={() => handleToggleTask(task)}>Completar</Button>}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function EventDialogContent({ user, firestore, event, onFinished }: { user: any, firestore: any, event: WithId<FamilyEvent> | null, onFinished: () => void }) {
    const [activity, setActivity] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [time, setTime] = useState('12:00');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (event) {
            const eventDate = new Date(event.date);
            setActivity(event.activity);
            setDate(eventDate);
            setTime(format(eventDate, 'HH:mm'));
        } else {
            setActivity('');
            setDate(new Date());
            setTime(format(new Date(), 'HH:mm'));
        }
    }, [event]);

    const handleSubmit = async () => {
        if (!user || !activity || !date || !time) return;
        setIsSaving(true);
        
        const [hours, minutes] = time.split(':').map(Number);
        const combinedDate = setMinutes(setHours(date, hours), minutes);

        const eventData = {
            userId: user.uid,
            activity,
            date: combinedDate.toISOString(),
            createdAt: serverTimestamp()
        };
        
        const updateData = {
            activity,
            date: combinedDate.toISOString(),
        }

        if (event) {
            const eventRef = doc(firestore, `users/${user.uid}/family_events/${event.id}`);
            await updateDoc(eventRef, updateData);
        } else {
            const eventsRef = collection(firestore, `users/${user.uid}/family_events`);
            await addDoc(eventsRef, eventData);
        }
        setIsSaving(false);
        onFinished();
    };

    return (
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{event ? "Reprogramar Momento" : "Agendar Tiempo de Calidad"}</DialogTitle>
                <DialogDescription>
                    {event ? "Ajusta los detalles de vuestro momento de conexión." : "Crea un nuevo espacio en tu agenda para conectar."}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="activity">
                    Actividad
                    </Label>
                    <Input id="activity" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Ej: Construir un cohete" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">
                    Fecha
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            locale={es}
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time">
                        Hora
                    </Label>
                    <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {event ? "Guardar Cambios" : "Agendar"}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}
