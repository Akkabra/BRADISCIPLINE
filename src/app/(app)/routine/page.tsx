'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Award, CheckCircle2, Loader2 } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const dailyTasks = [
    { id: 'task-1', title: 'Ducha Fría', description: 'Activa tu cuerpo y mente. Sin excusas.', points: 10 },
    { id: 'task-3', title: 'Ejercicio Físico', description: 'Mueve tu cuerpo. Honra tu templo.', points: 10 },
    { id: 'task-4', title: '1 Hora de Proyecto/Pasión', description: 'Construye tu futuro. Invierte en ti.', points: 10 },
    { id: 'task-5', title: 'Reflexión Nocturna', description: 'Evalúa tu día. Aprende. Mejora.', points: 10 },
];

const difficultyPoints = {
    easy: 10,
    medium: 20,
    hard: 30,
};

type Difficulty = 'easy' | 'medium' | 'hard';

type FocusRoutine = {
    id?: string;
    userId: string;
    date: string;
    objective1: string;
    objective2: string;
    objective3: string;
    completed1: boolean;
    completed2: boolean;
    completed3: boolean;
    difficulty1: Difficulty;
    difficulty2: Difficulty;
    difficulty3: Difficulty;
    createdAt: any;
};

function FocusRoutineCard({ onProgressChange, setCompletedObjectivesCount }: { onProgressChange: (progress: { completed: number, total: number }) => void, setCompletedObjectivesCount: (count: number) => void }) {
    const [routine, setRoutine] = useState<FocusRoutine | null>(null);
    const [loading, setLoading] = useState(true);
    
    const { user } = useAuth();
    const firestore = useFirestore();
    const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
    const focusRoutinesCol = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/focus_routines`) : null, [firestore, user]);

    useEffect(() => {
        if (!focusRoutinesCol || !user) return;
    
        const fetchOrCreateRoutine = async () => {
            setLoading(true);
            const q = query(focusRoutinesCol, where("date", "==", todayStr));
            const snapshot = await getDocs(q);
    
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data() as FocusRoutine;
                setRoutine({ ...data, id: doc.id });
                setLoading(false);
            } else {
                const newRoutineData: Omit<FocusRoutine, 'id'> = {
                    userId: user.uid,
                    date: todayStr,
                    objective1: '',
                    objective2: '',
                    objective3: '',
                    completed1: false,
                    completed2: false,
                    completed3: false,
                    difficulty1: 'easy',
                    difficulty2: 'easy',
                    difficulty3: 'easy',
                    createdAt: serverTimestamp(),
                };
                try {
                    // Create the doc, then set the state with the new doc's ID
                    const docRef = await addDoc(focusRoutinesCol, newRoutineData);
                    setRoutine({ ...newRoutineData, id: docRef.id });
                } catch (error) {
                    console.error("Error creating new routine:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
    
        fetchOrCreateRoutine();
    
    }, [focusRoutinesCol, todayStr, user]);

    useEffect(() => {
        if (routine) {
            const completed = (routine.completed1 ? difficultyPoints[routine.difficulty1] : 0) +
                              (routine.completed2 ? difficultyPoints[routine.difficulty2] : 0) +
                              (routine.completed3 ? difficultyPoints[routine.difficulty3] : 0);
            const total = difficultyPoints[routine.difficulty1] +
                          difficultyPoints[routine.difficulty2] +
                          difficultyPoints[routine.difficulty3];
            onProgressChange({ completed, total });

            const completedCount = (routine.completed1 ? 1 : 0) + (routine.completed2 ? 1 : 0) + (routine.completed3 ? 1 : 0);
            setCompletedObjectivesCount(completedCount);
        }
    }, [routine, onProgressChange, setCompletedObjectivesCount]);


    const updateRoutine = (field: keyof FocusRoutine, value: any) => {
        if (routine?.id && user) {
            const routineRef = doc(firestore, `users/${user.uid}/focus_routines/${routine.id}`);
            updateDoc(routineRef, { [field]: value });
            setRoutine(prev => prev ? { ...prev, [field]: value } : null);
        }
    };
    
    if (loading || !routine) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Rutina de Enfoque</CardTitle>
                    <CardDescription>Planifica tus 3 objetivos principales del día.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-primary/30">
            <CardHeader>
                <CardTitle>Rutina de Enfoque</CardTitle>
                <CardDescription>Planifica tus 3 objetivos principales del día y su dificultad.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2, 3].map(index => {
                    const i = index as 1 | 2 | 3;
                    const objective = routine[`objective${i}`];
                    const completed = routine[`completed${i}`];
                    const difficulty = routine[`difficulty${i}`];

                    return (
                        <div key={index} className="flex items-center gap-2 md:gap-4">
                            <Checkbox 
                                id={`objective-${index}`} 
                                checked={completed}
                                onCheckedChange={() => updateRoutine(`completed${i}`, !completed)}
                                className="h-8 w-8 rounded-md border-2"
                            />
                            <Input
                                type="text"
                                placeholder={`Objetivo ${i}`}
                                defaultValue={objective}
                                onBlur={(e) => updateRoutine(`objective${i}`, e.target.value)}
                                className={`flex-1 text-base ${completed ? 'line-through text-muted-foreground' : ''}`}
                                disabled={completed}
                            />
                            <Select
                                value={difficulty}
                                onValueChange={(value: Difficulty) => updateRoutine(`difficulty${i}`, value)}
                                disabled={completed}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Dificultad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Fácil (10)</SelectItem>
                                    <SelectItem value="medium">Medio (20)</SelectItem>
                                    <SelectItem value="hard">Difícil (30)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export default function RoutinePage() {
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    const [focusProgress, setFocusProgress] = useState({ completed: 0, total: 0 });
    const [completedObjectivesCount, setCompletedObjectivesCount] = useState(0);

    const handleTaskToggle = (taskId: string) => {
        setCompletedTasks(prev => 
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const completedStandardPoints = useMemo(() => {
        return completedTasks.reduce((acc, taskId) => {
            const task = dailyTasks.find(t => t.id === taskId);
            return acc + (task ? task.points : 0);
        }, 0);
    }, [completedTasks]);
    
    const totalStandardPoints = dailyTasks.reduce((acc, task) => acc + task.points, 0);

    const totalCompletedPoints = completedStandardPoints + focusProgress.completed;
    const totalPossiblePoints = totalStandardPoints + focusProgress.total;
    const progress = totalPossiblePoints > 0 ? (totalCompletedPoints / totalPossiblePoints) * 100 : 0;
    
    const completedCount = completedTasks.length + completedObjectivesCount;
    const totalCount = dailyTasks.length + 3;
    
    return (
        <div className="container mx-auto py-8 max-w-3xl">
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
                    <p className="text-sm text-muted-foreground mt-2">{totalCompletedPoints} de {totalPossiblePoints > 0 ? totalPossiblePoints : '...'} puntos obtenidos. {completedCount}/{totalCount} tareas completadas.</p>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                <FocusRoutineCard 
                    onProgressChange={setFocusProgress} 
                    setCompletedObjectivesCount={setCompletedObjectivesCount}
                />
                {dailyTasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        isCompleted={completedTasks.includes(task.id)}
                        onToggle={() => handleTaskToggle(task.id)}
                    />
                ))}
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

    