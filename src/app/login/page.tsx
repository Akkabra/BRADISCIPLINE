'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useAuth, useUser } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  const updateUserProfile = async (user: User) => {
    const userRef = doc(firestore, "users", user.uid);
    const profileData = {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    // Use merge:true to create the doc if it doesn't exist, or update it if it does.
    await setDoc(userRef, profileData, { merge: true });
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await updateUserProfile(result.user);
      // Redirect is handled by useEffect
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error con Google',
        description: error.message,
      });
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firstName = email.split('@')[0];
        
        // Update Firebase Auth profile
        await updateProfile(userCredential.user, {
          displayName: firstName,
        });

        // This will create the user document in Firestore.
        await updateUserProfile(userCredential.user);

      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        // This will ensure the user document exists, even if sign-up failed to create it.
        await updateUserProfile(userCredential.user);
      }
      // Redirect is handled by useEffect
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: isSignUp ? 'Error de Registro' : 'Error de Inicio de Sesión',
        description: error.message,
      });
    } finally {
        setIsLoading(false);
    }
  };

  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Logo className="justify-center text-3xl" />
        </div>
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-headline">
              {isSignUp ? 'CREA TU CUENTA' : 'INICIA TU JORNADA'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Únete para empezar a forjar tu disciplina.' : 'Ingresa para continuar tu camino.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailAuth}>
              <div className="space-y-4">
                <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isLoading}>
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg role="img" viewBox="0 0 24 24" className="mr-0 sm:mr-2 h-4 w-4">
                      <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.62-3.82 1.62-3.36 0-6.21-2.82-6.21-6.38s2.85-6.38 6.21-6.38c1.84 0 3.22.68 4.21 1.62l2.76-2.76C19.01 3.99 16.13 3 12.48 3c-5.18 0-9.42 4.13-9.42 9.33s4.24 9.33 9.42 9.33c2.6 0 4.6-1 6.12-2.38 1.57-1.43 2.34-3.6 2.34-6.32 0-.4-.04-.64-.1-1.02h-8.2z"></path>
                    </svg>
                  )}
                  <span className="hidden sm:inline">Continuar con Google</span>
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">O continuar con</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="nombre@ejemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || isGoogleLoading}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading || isGoogleLoading}/>
                </div>
                <Button type="submit" className="w-full font-bold" disabled={isLoading || isGoogleLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? 'REGISTRARSE' : 'ENTRAR'}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
              <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-primary p-1" disabled={isLoading || isGoogleLoading}>
                {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
