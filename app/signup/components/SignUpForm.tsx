'use client';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock } from "lucide-react"
import { signUp } from "@/lib/server_actions/auth";
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
//import { Turnstile } from '@marsidev/react-turnstile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const SignUpFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  confirmPassword: z.string(),
  //'cf-turnstile-response': z.string().min(1, { message: 'Please complete the CAPTCHA verification.' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const serverMessage = searchParams.get('message');
  // Removed unused state: const [turnstileToken, setTurnstileToken] = useState<string | null>(null);


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    trigger,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      //'cf-turnstile-response': '',
    }
  });

  useEffect(() => {
    if (serverMessage) {
      setError('root.serverError', { type: 'server', message: serverMessage });
    }
  }, [serverMessage, setError]);

  const onSubmit = async (data: SignUpFormValues) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    //formData.append('cf-turnstile-response', data['cf-turnstile-response']);

    try {
      await signUp(formData);
    } catch (error) {
      console.error("Sign up error:", error);
      setError('root.serverError', { type: 'server', message: 'An unexpected error occurred during sign up.' });
    }
  };

  /*const handleTurnstileSuccess = (token: string) => {
    // Removed setTurnstileToken(token); as turnstileToken state is removed
    setValue('cf-turnstile-response', token);
    trigger('cf-turnstile-response');
  };
  */

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Let&apos;s create an Account</CardTitle> {/* Escaped apostrophe */}
          <CardDescription>
            Enter your email and password to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.root?.serverError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
              {errors.root.serverError.message}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                    className="pl-9 pr-3 py-2 bg-zinc-950 text-white placeholder:text-[#484848] border-none rounded-md
                    focus:outline-none focus:ring focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200
                    hover:bg-zinc-900"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Make a Strong Password"
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                    className="pl-9 pr-3 py-2 bg-zinc-950 text-white placeholder:text-[#484848] border-none rounded-md
                    focus:outline-none focus:ring focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200
                    hover:bg-zinc-900"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm Your Password"
                    {...register("confirmPassword")}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    className="pl-9 pr-3 py-2 bg-zinc-950 text-white placeholder:text-[#484848] border-none rounded-md
                    focus:outline-none focus:ring focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200
                    hover:bg-zinc-900"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-emerald-500" disabled={isSubmitting}>
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "} {/* Escaped apostrophe */}
                <a href="/login" className="underline underline-offset-4 hover:text-emerald-500">
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#" className="hover:text-muted">Terms of Service</a>{" "}
        and <a href="#" className="hover:text-muted">Privacy Policy</a>.
      </div>
    </div>
  )
}
