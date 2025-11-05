'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/componentsui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getJournalAnalysis } from '@/app/actions';
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const journalSchema = z.object({
  achievements: z.string().min(10, 'Describe con más detalle tus logros.'),
  improvements: z.string().min(10, 'Sé específico en qué puedes mejorar.'),
  learnings: z.string().min(10, 'Profundiza en lo que aprendiste sobre ti.'),
});

type JournalEntry = z.infer<typeof journalSchema> & {
    id: string;
    date: string;
    emotion: string;
};

const mockJournalEntries: JournalEntry[] = [
    { id: '1', date: 'Ayer', emotion: 'Focused', achievements: 'Completé toda mi rutina y avancé en mi proyecto personal de carpintería. Me sentí muy productivo.', improvements: 'Podría haber evitado las distracciones del teléfono en la tarde. Perdí casi 30 minutos.', learnings: 'Soy más productivo cuando empiezo el día con una victoria clara como la ducha fría.' },
    { id: '2', date: 'Hace 2 días', emotion: 'Tired', achievements: 'Hice ejercicio a pesar del cansancio que arrastraba del trabajo. Fue difícil pero lo logré.', improvements: 'Mi dieta no fue la mejor, comí demasiado rápido y mal. Debo planificar mejor mis comidas.', learnings: 'Mi disciplina es fuerte incluso cuando mi energía no lo es. El compromiso es más fuerte que el estado de ánimo.' },
    { id: '3', date: 'Hace 3 días', emotion: 'Content', achievements: 'Pasé tiempo de calidad con mi hijo, sin distracciones. Estuvimos leyendo juntos.', improvements: 'Me costó desconectar del trabajo al principio. Necesito un ritual de transición.', learnings: 'La paternidad consciente me llena de una energía diferente, más calmada y satisfactoria.' },
];

const emotionOptions = [
  { label: 'Enfocado', value: 'Focused', icon: '🎯' },
  { label: 'Energizado', value: 'Energized', icon: '⚡️' },
  { label: 'Cansado', value: 'Tired', icon: '😴' },
  { label: 'Satisfecho', value: 'Content', icon: '😌' },
  { label: 'Frustrado', value: 'Frustrated', icon: '😠' },
];

export default function JournalPage() {
  const [entries, setEntries] = React.useState<JournalEntry[]>(mockJournalEntries);
  const [selectedEmotion, setSelectedEmotion] = React.useState<string | null>(null);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof journalSchema>>({
    resolver: zodResolver(journalSchema),
    defaultValues: { achievements: '', improvements: '', learnings: '' },
  });

  function onSubmit(values: z.infer<typeof journalSchema>) {
    if (!selectedEmotion) {
        toast({
            title: "Falta Emoción",
            description: "Por favor, selecciona cómo te sentiste hoy.",
            variant: "destructive"
        })
        return;
    }
    const newEntry = {
        ...values,
        id: (entries.length + 1).toString(),
        date: 'Hoy',
        emotion: selectedEmotion
    };
    setEntries(prev => [newEntry, ...prev]);
    form.reset();
    setSelectedEmotion(null);
    toast({
        title: "Entrada Guardada",
        description: "Tu reflexión ha sido registrada. Sigue así.",
        className: "border-primary"
    })
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    if (entries.length === 0) {
        setAnalysis("No hay suficientes entradas para realizar un análisis. Escribe al menos una reflexión.");
        setIsAnalyzing(false);
        return;
    }
    const journalTexts = entries.map(e => `Fecha: ${e.date}, Emoción: ${e.emotion}, Logros: ${e.achievements}, Mejoras: ${e.improvements}, Aprendizajes: ${e.learnings}`);
    const formData = new FormData();
    formData.append('entries', JSON.stringify(journalTexts));
    const result = await getJournalAnalysis(formData);
    setIsAnalyzing(false);

    if (result.error) {
      setAnalysis(`Error en el análisis: ${result.error}`);
    } else {
      setAnalysis(result.analysis ?? "No se pudo generar un análisis.");
    }
  };

  return (
    <Tabs defaultValue="new-entry" className="w-full">
      <div className="flex items-center mb-4">
        <TabsList>
          <TabsTrigger value="new-entry">Reflexión Nocturna</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        <div className="ml-auto">
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                Analizar Tendencias
            </Button>
        </div>
      </div>
       {(analysis || isAnalyzing) && (
          <Alert className="mb-4 border-primary/50 bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Análisis de IA</AlertTitle>
            <AlertDescription>
                {isAnalyzing ? "La IA está procesando tus reflexiones para encontrar patrones..." : analysis}
            </AlertDescription>
          </Alert>
        )}
      <TabsContent value="new-entry">
        <Card>
          <CardHeader>
            <CardTitle>Diario de Reflexión</CardTitle>
            <CardDescription>El día termina, la lección empieza. Registra tu progreso.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="achievements" render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Qué logré hoy?</FormLabel>
                    <FormControl><Textarea placeholder="Ej: Cumplí mi rutina, cerré un trato..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="improvements" render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Qué pude hacer mejor?</FormLabel>
                    <FormControl><Textarea placeholder="Ej: Procrastiné menos, me comuniqué mejor..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="learnings" render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Qué aprendí de mí mismo?</FormLabel>
                    <FormControl><Textarea placeholder="Ej: Descubrí que soy más resiliente de lo que pensaba..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div>
                  <FormLabel>¿Cómo me sentí hoy principalmente?</FormLabel>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {emotionOptions.map(opt => (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={selectedEmotion === opt.value ? 'default' : 'outline'}
                        onClick={() => setSelectedEmotion(opt.value)}
                        className="transition-all"
                      >
                        {opt.icon} <span className="ml-2">{opt.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full font-bold">GUARDAR REFLEXIÓN</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>
      <TabsContent value="history">
        <Card>
            <CardHeader>
                <CardTitle>Historial de Entradas</CardTitle>
                <CardDescription>Revisa tus reflexiones pasadas para medir tu crecimiento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {entries.map(entry => (
                    <div key={entry.id} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-primary">{entry.date}</h3>
                            <span className="text-2xl" title={emotionOptions.find(e => e.value === entry.emotion)?.label}>{emotionOptions.find(e => e.value === entry.emotion)?.icon}</span>
                        </div>
                        <p className="text-sm"><strong className="font-medium text-foreground/80">Logros:</strong> {entry.achievements}</p>
                        <p className="text-sm text-muted-foreground"><strong className="font-medium text-foreground/70">Mejoras:</strong> {entry.improvements}</p>
                        <p className="text-sm text-muted-foreground"><strong className="font-medium text-foreground/70">Aprendizajes:</strong> {entry.learnings}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
