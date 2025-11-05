import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Logo className="justify-center text-3xl" />
        </div>
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-headline">INICIA TU JORNADA</CardTitle>
            <CardDescription>Ingresa tus datos para acceder a tu panel de control.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.62-3.82 1.62-3.36 0-6.21-2.82-6.21-6.38s2.85-6.38 6.21-6.38c1.84 0 3.22.68 4.21 1.62l2.76-2.76C19.01 3.99 16.13 3 12.48 3c-5.18 0-9.42 4.13-9.42 9.33s4.24 9.33 9.42 9.33c2.6 0 4.6-1 6.12-2.38 1.57-1.43 2.34-3.6 2.34-6.32 0-.4-.04-.64-.1-1.02h-8.2z"></path></svg>
                Continuar con Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    O continuar con
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="nombre@ejemplo.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" required />
              </div>
               <Button asChild type="submit" className="w-full font-bold">
                <Link href="/dashboard">ENTRAR</Link>
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="#" className="underline text-primary">
                Regístrate
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
