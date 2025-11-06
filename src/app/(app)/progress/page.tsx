'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Award, CheckCircle, Shield, Target } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Ene", discipline: 65 },
  { month: "Feb", discipline: 72 },
  { month: "Mar", discipline: 80 },
  { month: "Abr", discipline: 85 },
  { month: "May", discipline: 78 },
  { month: "Jun", discipline: 92 },
]

const chartConfig = {
  discipline: {
    label: "Nivel de Disciplina",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const achievements = [
    { icon: <Award className="w-8 h-8 text-primary" />, title: 'En la Arena', description: 'Primer día completado.' },
    { icon: <CheckCircle className="w-8 h-8 text-[hsl(var(--chart-2))]" />, title: 'Primera Semana', description: '7 días de rutina completa.' },
    { icon: <Target className="w-8 h-8 text-primary" />, title: 'Guerrero del Foco', description: '21 días seguidos sin fallar.' },
    { icon: <Shield className="w-8 h-8 text-primary" />, title: 'Mente de Hierro', description: '30 reflexiones nocturnas.' },
];

export default function ProgressPage() {
  return (
    <div className="grid gap-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-headline tracking-tight text-primary">TU PROGRESO</h1>
        <p className="text-muted-foreground mt-2">Los números no mienten. Mide tu crecimiento.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolución Mensual de la Disciplina</CardTitle>
          <CardDescription>Tu puntaje de cumplimiento promedio cada mes.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)"/>
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis tickLine={false} axisLine={false} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="discipline" fill="var(--color-discipline)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Logros Desbloqueados</CardTitle>
          <CardDescription>Tus medallas de honor en el camino de la disciplina.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((ach, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4 sm:p-6 border rounded-lg bg-card/50 hover:border-primary/50 transition-colors">
                    <div className="p-3 sm:p-4 bg-muted rounded-full mb-3">{ach.icon}</div>
                    <p className="font-semibold font-headline text-base sm:text-lg">{ach.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{ach.description}</p>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
