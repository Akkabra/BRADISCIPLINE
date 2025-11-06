'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const faqs = [
    {
        question: "¿Cómo se calculan los 'Puntos de Disciplina'?",
        answer: "Los Puntos de Disciplina son una medida de tu compromiso. Se ganan completando tus tareas diarias y los 3 objetivos principales que defines cada mañana. Las tareas estándar tienen un valor fijo, mientras que los objetivos te dan más puntos según la dificultad (Fácil, Medio, Difícil) que les asignes."
    },
    {
        question: "¿Puedo cambiar mis 3 objetivos principales durante el día?",
        answer: "Sí, puedes editar el texto de tus objetivos en cualquier momento desde la sección 'Rutina'. La idea es que establezcas tu intención por la mañana, pero entendemos que los planes pueden necesitar ajustes. Lo importante es ser intencional con tu tiempo."
    },
    {
        question: "¿Qué pasa si no completo todas mis tareas un día?",
        answer: "No pasa nada. El objetivo no es la perfección, sino la constancia. BRA DISCIPLINE está diseñado para ayudarte a identificar patrones. Si fallas un día, analiza por qué en tu reflexión nocturna y vuelve con más fuerza al día siguiente. La disciplina se construye sobre la recuperación, no sobre la infalibilidad."
    },
    {
        question: "¿Mis datos son privados?",
        answer: "Absolutamente. Todos tus datos (rutinas, metas, reflexiones) se almacenan de forma segura y solo tú tienes acceso a ellos. Tu privacidad es una prioridad fundamental para nosotros."
    }
]

export default function SupportPage() {
  return (
    <div className="grid gap-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-headline tracking-tight text-primary">SOPORTE Y CONTACTO</h1>
        <p className="text-muted-foreground mt-2">Estamos aquí para ayudarte. Encuentra respuestas o ponte en contacto.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Preguntas Frecuentes (FAQ)</CardTitle>
            <CardDescription>Encuentra respuestas rápidas a las dudas más comunes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Enviar una Consulta</CardTitle>
                <CardDescription>Si no encuentras lo que buscas, envíanos un mensaje.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="topic">Asunto</Label>
                    <Select>
                        <SelectTrigger id="topic">
                            <SelectValue placeholder="Selecciona un tema" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="technical">Problema Técnico</SelectItem>
                            <SelectItem value="billing">Suscripción y Pagos</SelectItem>
                            <SelectItem value="feedback">Sugerencias y Feedback</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Tu Email de Contacto</Label>
                    <Input id="email" type="email" placeholder="tu@email.com"/>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea id="message" placeholder="Describe tu consulta con detalle..."/>
                 </div>
                 <Button className="w-full" disabled>Enviar Mensaje</Button>
                 <p className="text-xs text-center text-muted-foreground pt-2">(Funcionalidad de envío no implementada aún)</p>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
