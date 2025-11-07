'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useCollection, useFirestore, useMemoFirebase, type WithId } from "@/firebase";
import { cn } from "@/lib/utils";
import { addDoc, collection, doc, orderBy, query, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { add, differenceInDays, format, isPast, isToday, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Flag, Loader2, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";

type Goal = {
    userId: string;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
    createdAt: any;
};

export default function GoalsPage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<WithId<Goal> | null>(null);

    const goalsQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/goals`), orderBy("dueDate", "asc")) : null, [firestore, user]);
    const { data: goals, isLoading } = useCollection<Goal>(goalsQuery);

    const activeGoals = goals?.filter(g => !g.completed) || [];
    const completedGoals = goals?.filter(g => g.completed) || [];

    const handleOpenDialog = (goal: WithId<Goal> | null = null) => {
        setEditingGoal(goal);
        setIsDialogOpen(true);
    }
    
    const handleToggleComplete = async (goal: WithId<Goal>) => {
        if (!user) return;
        const goalRef = doc(firestore, `users/${user.uid}/goals/${goal.id}`);
        await updateDoc(goalRef, { completed: !goal.completed });
    };

    const handleDelete = async (goalId: string) => {
        if (!user) return;
        if (confirm("¿Estás seguro de que quieres eliminar esta meta? Esta acción no se puede deshacer.")) {
            const goalRef = doc(firestore, `users/${user.uid}/goals/${goalId}`);
            await deleteDoc(goalRef);
        }
    };


    return (
        <div className="grid gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl md:text-4xl font-headline tracking-tight text-primary">METAS</h1>
                    <p className="text-muted-foreground mt-2">Define tus objetivos. Reconstruye tu camino.</p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="font-bold w-full sm:w-auto" onClick={() => handleOpenDialog(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Meta
                        </Button>
                    </DialogTrigger>
                    <GoalDialogContent
                        user={user}
                        firestore={firestore}
                        goal={editingGoal}
                        onFinished={() => setIsDialogOpen(false)}
                    />
                </Dialog>
            </div>

            {isLoading && <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />}

            {!isLoading && activeGoals.length === 0 && completedGoals.length === 0 && (
                 <Card className="text-center py-12">
                    <CardHeader>
                        <Flag className="h-12 w-12 mx-auto text-muted-foreground" />
                        <CardTitle>Define tu Primera Meta</CardTitle>
                        <CardDescription>Un objetivo claro es el primer paso para la victoria.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button onClick={() => handleOpenDialog(null)}>Establecer una Meta</Button>
                    </CardContent>
                </Card>
            )}

            {!isLoading && activeGoals.length > 0 && (
                 <div>
                    <h2 className="text-2xl font-headline text-primary mb-4">Metas Activas</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} onEdit={handleOpenDialog} onToggleComplete={handleToggleComplete} onDelete={handleDelete} />
                        ))}
                    </div>
                </div>
            )}
            
            {!isLoading && completedGoals.length > 0 && (
                <div>
                    <h2 className="text-2xl font-headline text-primary mb-4 mt-8">Metas Conquistadas</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {completedGoals.map(goal => (
                           <GoalCard key={goal.id} goal={goal} onEdit={handleOpenDialog} onToggleComplete={handleToggleComplete} onDelete={handleDelete}/>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function GoalCard({ goal, onEdit, onToggleComplete, onDelete }: { goal: WithId<Goal>, onEdit: (goal: WithId<Goal>) => void, onToggleComplete: (goal: WithId<Goal>) => void, onDelete: (goalId: string) => void }) {
    const dueDate = new Date(goal.dueDate);
    const today = startOfDay(new Date());
    const daysRemaining = differenceInDays(dueDate, today);

    let urgencyColor = '';
    let urgencyText = '';

    if (goal.completed) {
        urgencyColor = 'border-green-500/20 bg-green-500/10 text-green-400';
        urgencyText = `Completado`;
    } else if (isPast(dueDate) && !isToday(dueDate)) {
        urgencyColor = 'border-destructive/40 bg-destructive/10 text-destructive';
        urgencyText = `Vencido hace ${Math.abs(daysRemaining)} días`;
    } else if (isToday(dueDate)) {
        urgencyColor = 'border-primary/50 bg-primary/10 text-primary';
        urgencyText = 'Vence Hoy';
    } else if (daysRemaining <= 7) {
        urgencyColor = 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
        urgencyText = `Vence en ${daysRemaining} días`;
    } else {
        urgencyText = format(dueDate, "d 'de' MMMM", { locale: es });
    }

    return (
        <Card className={cn("flex flex-col", goal.completed && "opacity-60")}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className={cn("text-xl pr-2", goal.completed && "line-through")}>{goal.title}</CardTitle>
                    <Checkbox checked={goal.completed} onClick={() => onToggleComplete(goal)} className="h-6 w-6" />
                </div>
                 <div className={cn("text-xs font-semibold py-1 px-2 rounded-full inline-block text-center w-fit", urgencyColor, !urgencyColor && "text-muted-foreground")}>
                    {urgencyText}
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{goal.description}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
                 <Button variant="outline" size="sm" className="w-full" onClick={() => onEdit(goal)} disabled={goal.completed}>
                    Editar
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                </Button>
            </CardFooter>
        </Card>
    );
}

function GoalDialogContent({ user, firestore, goal, onFinished }: { user: any, firestore: any, goal: WithId<Goal> | null, onFinished: () => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (goal) {
            setTitle(goal.title);
            setDescription(goal.description);
            setDueDate(new Date(goal.dueDate));
        } else {
            setTitle('');
            setDescription('');
            setDueDate(add(new Date(), { weeks: 1 }));
        }
    }, [goal]);

    const handleSubmit = async () => {
        if (!user || !title || !dueDate) return;
        setIsSaving(true);
        
        const goalData = {
            userId: user.uid,
            title,
            description,
            dueDate: startOfDay(dueDate).toISOString(),
        };

        if (goal) {
            const goalRef = doc(firestore, `users/${user.uid}/goals/${goal.id}`);
            await updateDoc(goalRef, goalData);
        } else {
            const goalsRef = collection(firestore, `users/${user.uid}/goals`);
            await addDoc(goalsRef, {
                ...goalData,
                completed: false,
                createdAt: serverTimestamp()
            });
        }
        setIsSaving(false);
        onFinished();
    };

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{goal ? "Editar Meta" : "Nueva Meta"}</DialogTitle>
                <DialogDescription>
                    {goal ? "Ajusta los detalles de tu objetivo." : "Define un nuevo objetivo claro y alcanzable."}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Correr 5km" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Entrenar 3 veces por semana..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha Límite</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="dueDate"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !dueDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dueDate ? format(dueDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={dueDate}
                                onSelect={setDueDate}
                                initialFocus
                                locale={es}
                                disabled={(date) => date < startOfDay(new Date())}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {goal ? "Guardar Cambios" : "Establecer Meta"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
    
