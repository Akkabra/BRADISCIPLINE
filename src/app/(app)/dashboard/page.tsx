'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Target, TrendingUp, Sparkles } from 'lucide-react';
import React from 'react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
} from "recharts"
import Link from 'next/link';

const chartData = [
  { area: "Físico", discipline: 86, month: "June" },
  { area: "Mental", discipline: 92, month: "June" },
  { area: "Emocional", discipline: 75, month: "June" },
  { area: "Proyecto", discipline: 80, month: "June" },
  { area: "Familia", discipline: 95, month: "June" },
]

const chartConfig = {
  discipline: {
    label: "Disciplina",
    color: "hsl(var(--primary))",
  },
  area: {
    label: "Área",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const [quote, setQuote] = React.useState('');

  React.useEffect(() => {
    const quotes = [
      "Cada día que cumples tu palabra, te respetas más a ti mismo.",
      "No esperes motivación, construye disciplina.",
      "El dolor de la disciplina o el dolor del arrepentimiento. Tú eliges.",
      "La constancia es la prueba de tu propósito.",
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-headline text-lg">BIENVENIDO, GUERRERO</CardDescription>
            <CardTitle className="text-4xl text-primary">Día 12</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">de tu racha de disciplina.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Progreso del Día</CardDescription>
            <CardTitle className="text-4xl text-primary">75%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">4 de 5 tareas completadas hoy.</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Impulso del Día
            </CardDescription>
            <CardTitle className="text-xl leading-snug">
              &ldquo;{quote}&rdquo;
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full font-bold">
              <Link href="/routine">
                EMPEZAR EL DÍA <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Disciplina</CardTitle>
            <CardDescription>Tu nivel de cumplimiento en las áreas clave este mes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
              <RadarChart data={chartData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <PolarAngleAxis dataKey="area" stroke="hsl(var(--foreground))" />
                <PolarGrid />
                <Radar
                  dataKey="discipline"
                  fill="var(--color-discipline)"
                  fillOpacity={0.6}
                  stroke="var(--color-discipline)"
                  dot={{
                    r: 4,
                    fillOpacity: 1,
                  }}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enfoque Principal</CardTitle>
            <CardDescription>Tus próximas tareas para conquistar el día.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FocusTask icon={<Zap className="h-5 w-5" />} title="Ducha Fría" time="06:00 AM" />
            <FocusTask icon={<Target className="h-5 w-5" />} title="Plan del Día" time="06:15 AM" />
            <FocusTask icon={<TrendingUp className="h-5 w-5" />} title="Ejercicio Físico" time="06:30 AM" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FocusTask({ icon, title, time }: { icon: React.ReactNode, title: string, time: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-muted p-3 rounded-lg">
        {React.cloneElement(icon as React.ReactElement, { className: "text-primary" })}
      </div>
      <div className="grid gap-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
      <Button asChild variant="outline" size="sm" className="ml-auto">
        <Link href="/routine">Ir a Rutina</Link>
      </Button>
    </div>
  );
}
