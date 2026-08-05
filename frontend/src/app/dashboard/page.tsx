import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";

const folders = [
  { name: "Projects", updated: "2 min ago", items: "12 items" },
  { name: "Contracts", updated: "1 hour ago", items: "4 items" },
  { name: "Media", updated: "Today", items: "9 items" },
];

const files = [
  { name: "brand-guidelines.pdf", type: "PDF", size: "4.2 MB" },
  { name: "launch-teaser.mp4", type: "Video", size: "128 MB" },
  { name: "onboarding.docx", type: "DOCX", size: "1.1 MB" },
];

const shares = [
  { name: "Shared with Design Team", access: "Can view" },
  { name: "Public link: launch reel", access: "Expires in 3 days" },
  { name: "Finance folder", access: "Restricted" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f3] text-black">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Files, folders, uploads, and shares.</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">New folder</Button>
            <Button>Upload files</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Storage used", "248 GB"],
                ["Shared links", "18"],
                ["Uploads today", "06"],
              ].map(([label, value]) => (
                <Card key={label} className="soft-reveal">
                  <CardContent className="p-5">
                    <div className="text-sm text-neutral-500">{label}</div>
                    <div className="mt-2 text-3xl font-semibold">{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="soft-reveal">
              <CardHeader>
                <CardTitle>Folder browser</CardTitle>
                <CardDescription>Ready for folder navigation and nested file listing APIs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {folders.map((folder) => (
                  <div key={folder.name} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-4">
                    <div>
                      <div className="font-medium">{folder.name}</div>
                      <div className="text-sm text-neutral-500">{folder.items}</div>
                    </div>
                    <div className="text-right text-sm text-neutral-500">{folder.updated}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="soft-reveal">
              <CardHeader>
                <CardTitle>Recent files</CardTitle>
                <CardDescription>File rows that can later be wired to real upload and download actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {files.map((file) => (
                  <div key={file.name} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-4">
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-neutral-500">{file.type}</div>
                    </div>
                    <div className="text-sm text-neutral-500">{file.size}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="soft-reveal">
              <CardHeader>
                <CardTitle>Upload section</CardTitle>
                <CardDescription>Basic fields for a future file uploader.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-dashed border-black/15 bg-black/[0.02] px-5 py-10 text-center text-sm text-neutral-600">Drop files here or choose a file to upload</div>
                <div className="space-y-2">
                  <Label htmlFor="folder">Assign to folder</Label>
                  <Input id="folder" placeholder="Projects / Q3" />
                </div>
                <Button className="w-full">Upload selected file</Button>
              </CardContent>
            </Card>

            <Card className="soft-reveal">
              <CardHeader>
                <CardTitle>Sharing section</CardTitle>
                <CardDescription>Built to support both user sharing and link sharing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {shares.map((share) => (
                  <div key={share.name} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                    <div className="font-medium">{share.name}</div>
                    <div className="text-sm text-neutral-500">{share.access}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="soft-reveal">
              <CardHeader>
                <CardTitle>Preview workspace</CardTitle>
                <CardDescription>Dedicated slots for PDF, DOCX, and video viewer components.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-black/10 bg-white px-4 py-5">PDF preview area</div>
                <div className="rounded-3xl border border-black/10 bg-white px-4 py-5">DOCX viewer area</div>
                <div className="rounded-3xl border border-black/10 bg-white px-4 py-5">Video player area</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-12" />

        <Card className="soft-reveal">
          <CardHeader>
            <CardTitle>Future API hooks</CardTitle>
            <CardDescription>This layout is intentionally basic so backend endpoints can attach without a redesign.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-neutral-600 md:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">GET files and folders</div>
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">POST uploads and share links</div>
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">GET previews and permissions</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}