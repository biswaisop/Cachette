import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f3] text-black">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-16 lg:px-8">
        <Card className="soft-reveal w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to manage your files, folders, and shared links.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
            <Button className="w-full">Log in</Button>
            <p className="text-center text-sm text-neutral-600">
              No account yet?{" "}
              <Link href="/signup" className="font-medium text-black">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}