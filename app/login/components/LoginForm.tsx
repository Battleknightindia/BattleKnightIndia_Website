"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { loginWithEmail } from "@/lib/server_actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OAuthButtons } from "./Oauth";

const LoginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  "cf-turnstile-response": z
    .string()
    .min(1, { message: "Please complete the CAPTCHA verification." }),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const serverMessage = searchParams.get("message");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    trigger,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      "cf-turnstile-response": "",
    },
  });

  React.useEffect(() => {
    if (serverMessage) {
      setError("root.serverError", {
        type: "server",
        message: decodeURIComponent(serverMessage),
      });
    }
  }, [serverMessage, setError]);

  const onSubmit = async (data: LoginFormValues) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("cf-turnstile-response", data["cf-turnstile-response"]);

    try {
      await loginWithEmail(formData);
    } catch (error) {
      console.error("Login error:", error);
      setError("root.serverError", {
        type: "server",
        message: "An unexpected error occurred during login.",
      });
    }
  };

  const handleTurnstileSuccess = (token: string) => {
    setValue("cf-turnstile-response", token);
    trigger("cf-turnstile-response");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription>
            Enter your email and password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} id="login-form" noValidate>
            {errors.root?.serverError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
                {errors.root.serverError.message}
              </div>
            )}
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="gmail@example.com"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                    className="pl-9 pr-3 py-2 bg-zinc-950 text-white placeholder:text-[#484848] border-none rounded-md
                    focus:outline-none focus:ring focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200
                    hover:bg-zinc-900"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
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
                    placeholder="Enter Your Password"
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                    className="pl-9 pr-3 py-2 bg-zinc-950 text-white placeholder:text-[#484848] border-none rounded-md
                    focus:outline-none focus:ring focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200
                    hover:bg-zinc-900"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onSuccess={handleTurnstileSuccess}
                onExpire={() => setValue("cf-turnstile-response", "")}
                onError={() => setValue("cf-turnstile-response", "")}
                options={{
                  theme: "dark",
                }}
                className="mx-auto"
              />
              {errors["cf-turnstile-response"] && (
                <p className="text-xs text-red-500 text-center mt-1">
                  {errors["cf-turnstile-response"].message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-emerald-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging In..." : "Login"}
              </Button>
              <div className="relative text-center text-sm text-gray-400 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-700">
                <span className="relative z-10 bg-zinc-950 px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <OAuthButtons/>
              </div>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="underline underline-offset-4 hover:text-emerald-500"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
