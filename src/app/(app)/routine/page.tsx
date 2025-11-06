'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Award, CheckCircle2, Target } from 'lucide-react';
import React, { useState, useMemo } from 'react';

const dailyTasks = [
    { id: 'task-1', title: 'Ducha Fría', description: 'Activa tu cuerpo y mente. Sin excusas.', points: 10 },
    { id: 'task-2', title: 'Rutina de Enfoque', description: 'Define tus 3 objetivos principales del día.', points: 20 },
    { id: 'task-3', title: 'Ejercicio Físico', description: 'Mueve tu cuerpo. Honra tu templo.', points: 10 },
    { id: 'task-4', title: '1 Hora de Proyecto/Pasión', description: 'Construye tu futuro. Invierte en ti.', points: 10 },
    { id: 'task-5', title: 'Reflexión Nocturna', description: 'Evalúa tu día. Aprende. Mejora.', points: 10 },
];

export default function RoutinePage() {
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);

    const handleTaskToggle = (taskId: string) => {
        setCompletedTasks(prev => 
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const totalCompletedPoints = useMemo(() => {
        return completedTasks.reduce((acc, taskId) => {
            const task = dailyTasks.find(t => t.id === taskId);
            return acc + (task ? task.points : 0);
        }, 0);
    }, [completedTasks]);
    
    const totalPossiblePoints = dailyTasks.reduce((acc, task) => acc + task.points, 0);

    const progress = totalPossiblePoints > 0 ? (totalCompletedPoints / totalPossiblePoints) * 100 : 0;
    
    const completedCount = completedTasks.length;
    const totalCount = dailyTasks.length;
    
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
                    <p className="text-sm text-muted-foreground mt-2">{totalCompletedPoints} de {totalPossiblePoints} puntos obtenidos. {completedCount}/{totalCount} tareas completadas.</p>
                </CardContent>
            </Card>

            <div className="grid gap-4">
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