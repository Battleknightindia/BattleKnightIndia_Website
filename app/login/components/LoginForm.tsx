
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OAuthButtons } from "./Oauth";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred method to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center">
            <OAuthButtons />
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
      </div>
    </div>
  );
}
