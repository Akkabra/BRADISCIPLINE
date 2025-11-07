'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Award, CheckCircle2, Loader2, BookOpen, Ban, Sparkles, Plus, Trash2 } from 'lucide-react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import type { WithId } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type RoutineTask = {
    userId: string;
    title: string;
    description: string;
    points: number;
    createdAt: any;
};

type Goal = {
    text: string;
    completed: boolean;
    difficulty: number;
};

type FocusRoutine = {
    userId: string;
    date: string;
    goals: Goal[];
    do: string;
    dont: string;
    motivation: string;
    completedTasks: string[];
};

const difficulties = [
    { label: 'Fácil', value: 10 },
    { label: 'Medio', value: 20 },
    { label: 'Difícil', value: 30 },
];

const defaultTasks: Omit<RoutineTask, 'userId' | 'createdAt'>[] = [
    { title: 'Ducha Fría', description: 'Activa tu cuerpo y mente. Sin excusas.', points: 10 },
    { title: '1 Hora de Proyecto/Pasión', description: 'Construye tu futuro. Invierte en ti.', points: 10 },
    { title: 'Reflexión Nocturna', description: 'Evalúa tu día. Aprende. Mejora.', points: 10 },
];


export default function RoutinePage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const [routine, setRoutine] = useState<WithId<FocusRoutine> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

    const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);
    
    const tasksQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/routine_tasks`), orderBy('createdAt', 'asc')) : null, [user, firestore]);
    const { data: routineTasks, isLoading: tasksLoading } = useCollection<RoutineTask>(tasksQuery);

    const getOrCreateRoutine = useCallback(async () => {
        if (!user || !firestore) {
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        const routinesCollectionRef = collection(firestore, `users/${user.uid}/focus_routines`);
        const q = query(routinesCollectionRef, where('date', '==', todayString));
        
        try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docData = querySnapshot.docs[0];
                setRoutine({ id: docData.id, ...docData.data() } as WithId<FocusRoutine>);
            } else {
                const newRoutineData: FocusRoutine = {
                    userId: user.uid,
                    date: todayString,
                    goals: [
                        { text: '', completed: false, difficulty: 10 },
                        { text: '', completed: false, difficulty: 10 },
                        { text: '', completed: false, difficulty: 10 },
                    ],
                    do: '',
                    dont: '',
                    motivation: '',
                    completedTasks: [],
                };
                const newDocRef = doc(routinesCollectionRef);
                await setDoc(newDocRef, newRoutineData);
                setRoutine({ id: newDocRef.id, ...newRoutineData });
            }
        } catch (error) {
            console.error("Error getting or creating routine:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, firestore, todayString]);

    const seedDefaultTasks = useCallback(async () => {
        if(user && firestore && !tasksLoading && routineTasks?.length === 0) {
            const tasksCollectionRef = collection(firestore, `users/${user.uid}/routine_tasks`);
            for(const task of defaultTasks) {
                await addDoc(tasksCollectionRef, {
                    ...task,
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                });
            }
        }
    }, [user, firestore, tasksLoading, routineTasks]);
    
    useEffect(() => {
        getOrCreateRoutine();
    }, [getOrCreateRoutine]);

    useEffect(() => {
        seedDefaultTasks();
    }, [seedDefaultTasks]);

    const handleTaskToggle = async (taskId: string) => {
        if (!routine) return;
        const newCompletedTasks = routine.completedTasks.includes(taskId)
            ? routine.completedTasks.filter(id => id !== taskId)
            : [...routine.completedTasks, taskId];
        
        setRoutine(prev => prev ? { ...prev, completedTasks: newCompletedTasks } : null);
        const routineRef = doc(firestore, `users/${user!.uid}/focus_routines/${routine.id}`);
        await updateDoc(routineRef, { completedTasks: newCompletedTasks });
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!user) return;
        if(confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            const taskRef = doc(firestore, `users/${user.uid}/routine_tasks/${taskId}`);
            await deleteDoc(taskRef);
        }
    }

    const totalTaskPoints = useMemo(() => {
        return routine?.completedTasks.reduce((acc, taskId) => {
            const task = routineTasks?.find(t => t.id === taskId);
            return acc + (task ? task.points : 0);
        }, 0) || 0;
    }, [routine?.completedTasks, routineTasks]);
    
    const totalGoalPoints = useMemo(() => {
        return routine?.goals.reduce((acc, goal) => acc + (goal.completed ? goal.difficulty : 0), 0) || 0;
    }, [routine]);

    const totalCompletedPoints = totalTaskPoints + totalGoalPoints;

    const totalPossiblePoints = useMemo(() => {
        const tasksPoints = routineTasks?.reduce((acc, task) => acc + task.points, 0) || 0;
        const goalsPoints = routine?.goals.reduce((acc, goal) => acc + (goal.text ? goal.difficulty : 0), 0) || 0;
        return tasksPoints + goalsPoints;
    }, [routine, routineTasks]);
    
    const progress = totalPossiblePoints > 0 ? (totalCompletedPoints / totalPossiblePoints) * 100 : 0;
    
    const completedCount = (routine?.completedTasks.length || 0) + (routine?.goals.filter(g => g.completed).length || 0);
    const totalCount = (routineTasks?.length || 0) + (routine?.goals.filter(g => !!g.text).length || 0);
    
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-headline tracking-tight text-primary">RUTINA DIARIA</h1>
                <p className="text-muted-foreground mt-2">Un paso a la vez. Construye tu día.</p>
            </div>

            <Card className="mb-8 border-primary/20">
                <CardHeader>
                    <CardTitle>Progreso del Día (Puntos de Disciplina)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">{totalCompletedPoints} de {totalPossiblePoints} puntos obtenidos. {completedCount}/{totalCount} tareas completadas.</p>
                </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    {isLoading ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Rutina de Enfoque</CardTitle>
                                <CardDescription>Define tus 3 objetivos principales del día.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </CardContent>
                        </Card>
                    ) : (
                       <FocusRoutineAccordion routine={routine} setRoutine={setRoutine} />
                    )}

                    {(tasksLoading || isLoading) ? (
                         <Card>
                            <CardHeader>
                                <CardTitle>Tareas Diarias</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </CardContent>
                        </Card>
                    ) : (
                        routineTasks?.map(task => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                isCompleted={routine?.completedTasks.includes(task.id) || false}
                                onToggle={() => handleTaskToggle(task.id)}
                                onDelete={() => handleDeleteTask(task.id)}
                            />
                        ))
                    )}
                     <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                        <DialogTrigger asChild>
                             <Button variant="outline" className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Añadir Tarea Personalizada
                            </Button>
                        </DialogTrigger>
                        <TaskDialogContent onFinished={() => setIsTaskDialogOpen(false)} />
                    </Dialog>
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                         <Card>
                             <CardHeader>
                                 <CardTitle>Plan del Día</CardTitle>
                                  <CardDescription>Establece tus intenciones para maximizar tu enfoque.</CardDescription>
                             </CardHeader>
                             <CardContent className="flex items-center justify-center h-64">
                                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                             </CardContent>
                         </Card>
                    ): (
                        <DailyPlanCard routine={routine} setRoutine={setRoutine} />
                    )}
                </div>

            </div>


            {progress >= 100 && (
                <Card className="mt-8 border-primary bg-primary/10">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Award className="w-12 h-12 text-primary" />
                        <div>
                            <CardTitle className="text-primary">¡DÍA CONQUISTADO!</CardTitle>
                            <CardDescription>Has cumplido tu palabra. El respeto se gana, y hoy te lo has ganado a ti mismo.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}

function TaskCard({ task, isCompleted, onToggle, onDelete }: { task: WithId<RoutineTask>, isCompleted: boolean, onToggle: () => void, onDelete: () => void }) {
    return (
        <Card className={`transition-all duration-300 group ${isCompleted ? 'border-primary/50 bg-card/50' : 'border-border hover:border-primary/50'}`}>
            <CardContent className="p-4 flex items-center gap-4">
                <Checkbox id={task.id} checked={isCompleted} onCheckedChange={onToggle} className="h-8 w-8 rounded-md border-2" />
                <div className="flex-1 grid gap-0.5">
                    <label htmlFor={task.id} className={`font-medium text-lg cursor-pointer ${isCompleted ? 'text-primary line-through' : ''}`}>{task.title}</label>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <div className="flex flex-col items-center justify-center pl-4">
                    <span className={`font-bold text-lg ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>{task.points}</span>
                    <span className="text-xs text-muted-foreground">pts</span>
                </div>
                <Button onClick={onDelete} variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                {isCompleted && <CheckCircle2 className="h-6 w-6 text-[hsl(var(--chart-2))]" />}
            </CardContent>
        </Card>
    )
}

function FocusRoutineAccordion({ routine, setRoutine }: { routine: WithId<FocusRoutine> | null, setRoutine: React.Dispatch<React.SetStateAction<WithId<FocusRoutine> | null>> }) {
    const { user } = useAuth();
    const firestore = useFirestore();

    const handleGoalChange = async (index: number, field: keyof Goal, value: string | boolean | number) => {
        if (!routine) return;

        const updatedGoals = [...routine.goals];
        // This is a safe cast because we control the types being passed
        (updatedGoals[index] as any)[field] = value;

        setRoutine(prev => prev ? { ...prev, goals: updatedGoals } : null);

        const routineRef = doc(firestore, `users/${user!.uid}/focus_routines/${routine.id}`);
        await updateDoc(routineRef, { goals: updatedGoals });
    };

    if (!routine) return null;

    const completedPoints = routine.goals.reduce((acc, g) => acc + (g.completed ? g.difficulty : 0), 0);

    return (
        <Card>
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex items-center gap-4 w-full">
                            <div className="flex-1 grid gap-0.5 text-left">
                                <div className="font-medium text-lg">Rutina de Enfoque</div>
                                <p className="text-sm text-muted-foreground">Define tus 3 objetivos principales del día.</p>
                            </div>
                            <div className="flex flex-col items-center justify-center pl-4">
                                <span className="font-bold text-lg">{completedPoints}</span>
                                <span className="text-xs text-muted-foreground">pts</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <div className="space-y-4">
                            {routine.goals.map((goal, index) => (
                                <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                                    <Checkbox
                                        id={`goal-${index}`}
                                        checked={goal.completed}
                                        onCheckedChange={(checked) => handleGoalChange(index, 'completed', !!checked)}
                                        className="h-6 w-6"
                                        disabled={!goal.text}
                                    />
                                    <Input
                                        placeholder={`Objetivo ${index + 1}`}
                                        value={goal.text}
                                        onChange={(e) => handleGoalChange(index, 'text', e.target.value)}
                                        className="flex-grow bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                    <Select
                                        value={String(goal.difficulty)}
                                        onValueChange={(value) => handleGoalChange(index, 'difficulty', Number(value))}
                                    >
                                        <SelectTrigger className="w-[100px] text-xs h-8">
                                            <SelectValue placeholder="Dificultad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {difficulties.map(d => (
                                                <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}

function DailyPlanCard({ routine, setRoutine }: { routine: WithId<FocusRoutine> | null, setRoutine: React.Dispatch<React.SetStateAction<WithId<FocusRoutine> | null>> }) {
    const { user } = useAuth();
    const firestore = useFirestore();

    const routineRef = useMemo(() => {
        if (!user || !routine) return null;
        return doc(firestore, `users/${user.uid}/focus_routines/${routine.id}`);
    }, [user, routine, firestore]);

    // Debounce effect for saving text area changes
    useEffect(() => {
        if (!routine || !routineRef) return;

        const handler = setTimeout(async () => {
             // We only update the fields that this component is responsible for.
            await updateDoc(routineRef, {
                do: routine.do,
                dont: routine.dont,
                motivation: routine.motivation,
            });
        }, 1000); // Wait 1 second after the user stops typing

        return () => {
            clearTimeout(handler);
        };
    }, [routine?.do, routine?.dont, routine?.motivation, routineRef]);

    const handleFieldChange = (field: 'do' | 'dont' | 'motivation', value: string) => {
        setRoutine(prev => prev ? { ...prev, [field]: value } : null);
    };

    if (!routine) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Plan del Día</CardTitle>
                <CardDescription>Establece tus intenciones para maximizar tu enfoque y disciplina.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-green-400">
                        <BookOpen className="h-4 w-4" />
                        Qué voy a hacer hoy
                    </Label>
                    <Textarea
                        placeholder="Define tus acciones clave..."
                        value={routine.do}
                        onChange={(e) => handleFieldChange('do', e.target.value)}
                        className="bg-muted/50 border-green-500/20 focus-visible:ring-green-400"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-red-400">
                        <Ban className="h-4 w-4" />
                        Qué NO voy a hacer hoy
                    </Label>
                    <Textarea
                        placeholder="Identifica tus distracciones y evítalas..."
                        value={routine.dont}
                        onChange={(e) => handleFieldChange('dont', e.target.value)}
                         className="bg-muted/50 border-destructive/20 focus-visible:ring-destructive"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-primary">
                        <Sparkles className="h-4 w-4" />
                        Qué me motiva hoy
                    </Label>
                    <Textarea
                        placeholder="Conecta con tu propósito..."
                        value={routine.motivation}
                        onChange={(e) => handleFieldChange('motivation', e.target.value)}
                        className="bg-muted/50 border-primary/20 focus-visible:ring-primary"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function TaskDialogContent({ onFinished }: { onFinished: () => void }) {
    const { user } = useAuth();
    const firestore = useFirestore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState(10);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!user || !title || !description) return;
        setIsSaving(true);
        const tasksCollectionRef = collection(firestore, `users/${user.uid}/routine_tasks`);
        try {
            await addDoc(tasksCollectionRef, {
                userId: user.uid,
                title,
                description,
                points,
                createdAt: serverTimestamp(),
            });
            onFinished();
        } catch (error) {
            console.error("Error adding new task: ", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Añadir Tarea Personalizada</DialogTitle>
                <DialogDescription>
                    Define una nueva tarea para tu rutina diaria.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Leer 10 páginas"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Un hábito para crecer"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="points">Puntos de Disciplina</Label>
                    <Input id="points" type="number" value={points} onChange={e => setPoints(Number(e.target.value))} placeholder="10"/>
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Guardar Tarea
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

    