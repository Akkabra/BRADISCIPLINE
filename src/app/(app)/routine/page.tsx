'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Award, CheckCircle2, Loader2, BookOpen, Ban, Sparkles } from 'lucide-react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { WithId } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const dailyTasks = [
    { id: 'task-1', title: 'Ducha Fría', description: 'Activa tu cuerpo y mente. Sin excusas.', points: 10 },
    { id: 'task-4', title: '1 Hora de Proyecto/Pasión', description: 'Construye tu futuro. Invierte en ti.', points: 10 },
    { id: 'task-5', title: 'Reflexión Nocturna', description: 'Evalúa tu día. Aprende. Mejora.', points: 10 },
];

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
};

const difficulties = [
    { label: 'Fácil', value: 10 },
    { label: 'Medio', value: 20 },
    { label: 'Difícil', value: 30 },
];

export default function RoutinePage() {
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    
    const { user } = useAuth();
    const firestore = useFirestore();
    const [routine, setRoutine] = useState<WithId<FocusRoutine> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);

    useEffect(() => {
        const getOrCreateRoutine = async () => {
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
        };
        
        getOrCreateRoutine();
    }, [user, firestore, todayString]);

    const handleTaskToggle = (taskId: string) => {
        setCompletedTasks(prev => 
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const totalTaskPoints = useMemo(() => {
        return completedTasks.reduce((acc, taskId) => {
            const task = dailyTasks.find(t => t.id === taskId);
            return acc + (task ? task.points : 0);
        }, 0);
    }, [completedTasks]);
    
    const totalGoalPoints = useMemo(() => {
        return routine?.goals.reduce((acc, goal) => acc + (goal.completed ? goal.difficulty : 0), 0) || 0;
    }, [routine]);

    const totalCompletedPoints = totalTaskPoints + totalGoalPoints;

    const totalPossiblePoints = useMemo(() => {
        const tasksPoints = dailyTasks.reduce((acc, task) => acc + task.points, 0);
        const goalsPoints = routine?.goals.reduce((acc, goal) => acc + (goal.text ? goal.difficulty : 0), 0) || 0;
        return tasksPoints + goalsPoints;
    }, [routine]);
    
    const progress = totalPossiblePoints > 0 ? (totalCompletedPoints / totalPossiblePoints) * 100 : 0;
    
    const completedCount = completedTasks.length + (routine?.goals.filter(g => g.completed).length || 0);
    const totalCount = dailyTasks.length + (routine?.goals.filter(g => !!g.text).length || 0);
    
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-headline tracking-tight text-primary">RUTINA DIARIA</h1>
                <p className="text-muted-foreground mt-2">La ejecución es la victoria. Completa tus tareas una por una.</p>
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

                    {dailyTasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            isCompleted={completedTasks.includes(task.id)}
                            onToggle={() => handleTaskToggle(task.id)}
                        />
                    ))}
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

function TaskCard({ task, isCompleted, onToggle }: { task: {id: string, title: string, description: string, points: number}, isCompleted: boolean, onToggle: () => void }) {
    return (
        <Card className={`transition-all duration-300 ${isCompleted ? 'border-primary/50 bg-card/50' : 'border-border hover:border-primary/50'}`}>
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
