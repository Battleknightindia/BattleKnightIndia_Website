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
// Updated import - make sure this path is correct for your project
import { signUp } from "@/lib/server_actions/auth";
import { useSearchParams } from 'next/navigation'; // Keep useSearchParams if you still use it for other messages, otherwise remove it
import { useEffect } from 'react'; // Keep useEffect if you still use it for other messages, otherwise remove it
//import { Turnstile } from '@marsidev/react-turnstile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { redirect } from 'next/navigation'; // Import redirect if you handle success client-side

const SignUpFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  // Client-side validation for min length
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
  // --- REMOVED serverMessage handling from URL ---
  // const searchParams = useSearchParams();
  // const serverMessage = searchParams.get('message');

  // Removed unused state: const [turnstileToken, setTurnstileToken] = useState<string | null>(null);


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    // Removed setValue, trigger as they relate to commented out Turnstile
    // setValue,
    // trigger,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      //'cf-turnstile-response': '',
    }
  });

  // --- REMOVED useEffect that reads URL message ---
  // useEffect(() => {
  //   if (serverMessage) {
  //     setError('root.serverError', { type: 'server', message: serverMessage });
  //   }
  // }, [serverMessage, setError]);

  const onSubmit = async (data: SignUpFormValues) => {
    // Clear previous server errors
    setError('root.serverError', { type: 'server', message: '' });

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    //formData.append('cf-turnstile-response', data['cf-turnstile-response']);

    try {
      // Call the server action
      const result = await signUp(formData);

      // Handle the result returned by the server action
      if (!result.success) {
        // If sign up failed, display the error message from the server action
        setError('root.serverError', { type: 'server', message: result.message || 'An unknown error occurred during sign up.' });
      } else {
        // If sign up was successful, the server action redirects,
        // OR if you changed the server action to return { success: true },
        // you would handle the redirect here:
        // redirect('/login?message=Signup%20successful.%20Please%20login.');
      }

    } catch (error: unknown) { // Catch potential network errors or unhandled exceptions
      console.error("Sign up error:", error);
      // Display a generic error message for unexpected errors
      setError('root.serverError', { type: 'server', message: error.message || 'An unexpected error occurred during sign up.' });
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
          {/* Display server-side errors */}
          {errors.root?.serverError && errors.root.serverError.message && ( // Check if message exists
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
                {/* Display client-side Zod errors for email */}
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
                {/* Display client-side Zod errors for password */}
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
                {/* Display client-side Zod errors for confirmPassword */}
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
