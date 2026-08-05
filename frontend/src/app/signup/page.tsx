import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f3] text-black">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-16 lg:px-8">
        <Card className="soft-reveal w-full max-w-md">
          <CardHeader>
            <CardTitle>Create your workspace</CardTitle>
            <CardDescription>Set up a clean home for file uploads, folders, and sharing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" type="text" placeholder="Alex Morgan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password" />
            </div>
            <Button className="w-full">Create account</Button>
            <p className="text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-black">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}