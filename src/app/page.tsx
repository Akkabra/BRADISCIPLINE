import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Target, BarChart, Users, Zap } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Logo />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild variant="ghost">
            <Link href="/login">
              Iniciar Sesión
            </Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/login">Empezar Ahora</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative">
           <Image
            src="https://picsum.photos/seed/bra-discipline-hero/1920/1080"
            alt="Hero"
            fill
            className="object-cover object-center opacity-10"
            data-ai-hint="man silhouette gym"
            priority
          />
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    FORJA TU DISCIPLINA. RECONSTRUYE TU VIDA.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    BRA DISCIPLINE es tu gimnasio mental y espiritual. Una herramienta para hombres decididos a tomar el control a través de la constancia, el enfoque y un propósito claro.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">
                      EMPIEZA TU TRANSFORMACIÓN
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-headline tracking-tighter sm:text-5xl text-primary">El Arsenal de tu Disciplina</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Todo lo que necesitas para construir la versión más fuerte de ti mismo, día a día.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <FeatureCard
                icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
                title="Rutina Diaria"
                description="Una guía paso a paso para ejecutar tus tareas de disciplina sin dudar."
              />
              <FeatureCard
                icon={<Target className="h-8 w-8 text-primary" />}
                title="Diario de Reflexión"
                description="Registra tus victorias, aprendizajes y estado emocional. La IA te mostrará tendencias."
              />
              <FeatureCard
                icon={<BarChart className="h-8 w-8 text-primary" />}
                title="Estadísticas de Progreso"
                description="Visualiza tu crecimiento con gráficos y logros. Convierte el esfuerzo en datos."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Espacio Padre/Familia"
                description="Integra tu rol de padre y líder. Agenda tiempo de calidad y fortalece vínculos."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Propósito y Enfoque"
                description="Frases diarias, logros y un sistema diseñado para mantenerte en el camino."
              />
               <FeatureCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 2v20"/><path d="m5 7 7-5 7 5"/></svg>}
                title="Poder Simbólico"
                description="Inspirado en la fuerza y dirección de la runa Tiwaz, cada elemento te recuerda tu objetivo."
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-headline tracking-tighter md:text-4xl/tight text-primary">
                La disciplina es el puente entre tus metas y tus logros.
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Deja de esperar la motivación. Es hora de construir algo real. Únete a BRA DISCIPLINE.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button asChild size="lg" className="w-full font-bold tracking-wider">
                  <Link href="/login">
                    CONSTRUYE TU LEGADO
                  </Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} BRA DISCIPLINE. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Términos de Servicio
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="grid gap-2 transform transition-transform duration-300 hover:scale-105">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-bold font-headline">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
