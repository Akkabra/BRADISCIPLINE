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

const dailyTasks = [
    { id: 'task-1', title: 'Ducha Fría', description: 'Activa tu cuerpo y mente. Sin excusas.' },
    { id: 'task-3', title: 'Ejercicio Físico', description: 'Mueve tu cuerpo. Honra tu templo.' },
    { id: 'task-4', title: '1 Hora de Proyecto/Pasión', description: 'Construye tu futuro. Invierte en ti.' },
    { id: 'task-5', title: 'Reflexión Nocturna', description: 'Evalúa tu día. Aprende. Mejora.' },
];

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
    createdAt: any;
};


function FocusRoutineCard() {
    const [routine, setRoutine] = useState<FocusRoutine | null>(null);
    const [loading, setLoading] = useState(true);
    const [objectives, setObjectives] = useState(['', '', '']);
    const [completed, setCompleted] = useState([false, false, false]);
    
    const { user } = useAuth();
    const firestore = useFirestore();

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const focusRoutinesCol = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/focus_routines`) : null, [firestore, user]);

    useEffect(() => {
        if (!focusRoutinesCol || !user) return;

        const q = query(focusRoutinesCol, where("date", "==", todayStr));

        getDocs(q).then(snapshot => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data() as FocusRoutine;
                setRoutine({ ...data, id: doc.id });
                setObjectives([data.objective1, data.objective2, data.objective3]);
                setCompleted([data.completed1, data.completed2, data.completed3]);
            } else {
                 const newRoutine: FocusRoutine = {
                    userId: user.uid,
                    date: todayStr,
                    objective1: '',
                    objective2: '',
                    objective3: '',
                    completed1: false,
                    completed2: false,
                    completed3: false,
                    createdAt: serverTimestamp(),
                };
                addDoc(focusRoutinesCol, newRoutine).then(docRef => {
                    setRoutine({...newRoutine, id: docRef.id});
                });
            }
            setLoading(false);
        });

    }, [focusRoutinesCol, todayStr, user]);

    const handleObjectiveChange = (index: number, value: string) => {
        const newObjectives = [...objectives];
        newObjectives[index] = value;
        setObjectives(newObjectives);
    };

    const handleSaveObjective = (index: number) => {
        if (routine?.id) {
            const routineRef = doc(firestore, `users/${user!.uid}/focus_routines/${routine.id}`);
            updateDoc(routineRef, {
                [`objective${index + 1}`]: objectives[index]
            });
        }
    };
    
    const handleCompletionChange = (index: number) => {
        if (routine?.id) {
            const newCompleted = [...completed];
            newCompleted[index] = !newCompleted[index];
            setCompleted(newCompleted);

            const routineRef = doc(firestore, `users/${user!.uid}/focus_routines/${routine.id}`);
            updateDoc(routineRef, {
                [`completed${index + 1}`]: newCompleted[index]
            });
        }
    }


    if (loading) {
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
                <CardDescription>Planifica tus 3 objetivos principales del día.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {[0, 1, 2].map(index => (
                    <div key={index} className="flex items-center gap-4">
                         <Checkbox 
                            id={`objective-${index}`} 
                            checked={completed[index]}
                            onCheckedChange={() => handleCompletionChange(index)}
                            className="h-8 w-8 rounded-md border-2"
                        />
                        <Input
                            type="text"
                            placeholder={`Objetivo ${index + 1}`}
                            value={objectives[index]}
                            onChange={e => handleObjectiveChange(index, e.target.value)}
                            onBlur={() => handleSaveObjective(index)}
                            className={`flex-1 text-base ${completed[index] ? 'line-through text-muted-foreground' : ''}`}
                            disabled={completed[index]}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function RoutinePage() {
    const [completedTasks, setCompletedTasks] = React.useState<string[]>(['task-1']);
    
    const handleTaskToggle = (taskId: string) => {
        setCompletedTasks(prev => 
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const progress = (completedTasks.length / dailyTasks.length) * 100;

    return (
        <div className="container mx-auto py-8 max-w-3xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-headline tracking-tight text-primary">RUTINA DIARIA</h1>
                <p className="text-muted-foreground mt-2">La ejecución es la victoria. Completa tus tareas una por una.</p>
            </div>

            <Card className="mb-8 border-primary/20">
                <CardHeader>
                    <CardTitle>Progreso del Día</CardTitle>
                </CardHeader>
                <CardContent>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">{completedTasks.length} de {dailyTasks.length} tareas completadas.</p>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                <FocusRoutineCard />
                {dailyTasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        isCompleted={completedTasks.includes(task.id)}
                        onToggle={() => handleTaskToggle(task.id)}
                    />
                ))}
            </div>

            {progress === 100 && (
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

function TaskCard({ task, isCompleted, onToggle }: { task: {id: string, title: string, description: string}, isCompleted: boolean, onToggle: () => void }) {
    return (
        <Card className={`transition-all duration-300 ${isCompleted ? 'border-primary/50 bg-card/50' : 'border-border hover:border-primary/50'}`}>
            <CardContent className="p-4 flex items-center gap-4">
                <Checkbox id={task.id} checked={isCompleted} onCheckedChange={onToggle} className="h-8 w-8 rounded-md border-2" />
                <div className="flex-1 grid gap-0.5">
                    <label htmlFor={task.id} className={`font-medium text-lg cursor-pointer ${isCompleted ? 'text-primary line-through' : ''}`}>{task.title}</label>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                {isCompleted && <CheckCircle2 className="h-6 w-6 text-[hsl(var(--chart-2))]" />}
            </CardContent>
        </Card>
    )
}
