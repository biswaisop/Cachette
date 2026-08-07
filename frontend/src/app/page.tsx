import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const features = [
  {
    title: "Folder-first storage",
    description:
      "Nested folders, clean file organization, and a layout that is ready for future API-driven browsing.",
  },
  {
    title: "Direct and link sharing",
    description:
      "Share files with other users or create link-based access without changing the interface later.",
  },
  {
    title: "Built-in preview surface",
    description:
      "Prepared layout areas for video playback, PDF preview, and DOCX reading inside the app.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    note: "For local testing and first uploads.",
    features: ["Basic file browser", "Single-user workspace", "Preview-ready cards"],
  },
  {
    name: "Pro",
    price: "$12",
    note: "For shared teams and active storage use.",
    features: ["Folder sharing", "Viewer support", "Activity tracking"],
    featured: true,
  },
  {
    name: "Team",
    price: "$24",
    note: "For multi-user workspaces and higher usage.",
    features: ["Role-based sharing", "Advanced upload flow", "Admin controls"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f3] text-black">
      <SiteHeader />

      <main>
        <section className="noise-grid border-b border-black/10">
          <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
            <div className="soft-reveal space-y-8">
              <Badge>File storage and sharing</Badge>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                  Minimal file storage, sharing, and preview UI for a modern workspace.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
                  Cachette is designed as a clean file workspace shell: folders, uploads,
                  sharing, and document or video previews, all ready to connect to backend APIs.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>
            </div>

            <Card className="soft-reveal relative overflow-hidden bg-white/85">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Workspace preview</CardTitle>
                    <CardDescription>Layout prepared for future backend APIs.</CardDescription>
                  </div>
                  <div className="rounded-full border border-black/10 bg-black px-3 py-1 text-xs font-medium text-white">
                    Online
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-black/10 bg-[#f8f8f7] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Projects / Product / Q3</span>
                    <span className="text-neutral-500">12 files</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3 text-sm text-neutral-600">
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span>Brand guideline.pdf</span>
                      <span>Preview</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span>Launch reel.mp4</span>
                      <span>Video</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span>Contract.docx</span>
                      <span>Document</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {[
                    ["Uploads", "24"],
                    ["Shared", "08"],
                    ["Folders", "16"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                      <div className="text-neutral-500">{label}</div>
                      <div className="mt-2 text-xl font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="upload" className="border-y border-black/10 bg-white/70">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="space-y-4">
              <Badge>Upload and share</Badge>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                A simple upload section that can later plug into your file APIs.
              </h2>
              <p className="max-w-xl leading-7 text-neutral-600">
                Drop files in, assign them to folders, and connect sharing controls without changing the overall structure of the UI.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upload queue</CardTitle>
                  <CardDescription>Pending file selections and progress states.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-neutral-600">
                  <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.02] p-5 text-center">Drag files here</div>
                  <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                    <span>video-intro.mp4</span>
                    <span>72%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sharing options</CardTitle>
                  <CardDescription>Direct user access and link-based access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-neutral-600">
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">Share with users</div>
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">Create public link</div>
                  <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">Set preview permissions</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge>Pricing</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Simple plans for a file-first product.
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-neutral-600">
              These are placeholder tiers for the UI. They can be remapped later to real billing or workspace limits.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.featured ? "border-black/25 bg-white" : "bg-white/80"}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.note}</CardDescription>
                    </div>
                    {plan.featured ? (
                      <span className="rounded-full border border-black bg-black px-3 py-1 text-xs font-medium text-white">Popular</span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-semibold tracking-[-0.04em]">{plan.price}</div>
                  <Separator className="my-6" />
                  <ul className="space-y-3 text-sm text-neutral-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-black" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
