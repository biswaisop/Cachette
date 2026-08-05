import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

const profileStats = [
  ["Files", "148"],
  ["Shared", "22"],
  ["Folders", "31"],
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f3] text-black">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="soft-reveal">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Basic user details for a future account settings flow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-black/10 bg-white text-2xl font-semibold">
                AM
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input id="profile-name" defaultValue="Alex Morgan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" defaultValue="alex@cachette.app" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-bio">Bio</Label>
                  <Input id="profile-bio" defaultValue="Building a private file workspace." />
                </div>
              </div>
              <Button className="w-full">Save profile</Button>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="soft-reveal">
              <CardHeader>
                <CardTitle>Workspace stats</CardTitle>
                <CardDescription>Summary cards for the account overview page.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {profileStats.map(([label, value]) => (
                  <div key={label} className="rounded-3xl border border-black/10 bg-white px-5 py-6">
                    <div className="text-sm text-neutral-500">{label}</div>
                    <div className="mt-2 text-3xl font-semibold">{value}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="soft-reveal">
              <CardHeader>
                <CardTitle>Connected storage</CardTitle>
                <CardDescription>
                  Where uploads and shares will be managed once the APIs are connected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-600">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">Personal workspace</div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">Shared folders</div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">Preview permissions</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}