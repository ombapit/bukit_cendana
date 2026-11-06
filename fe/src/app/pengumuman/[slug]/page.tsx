"use client";

import { Suspense, use } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { PengumumanContent } from "../page";
import { Skeleton } from "@/components/ui/skeleton";

export default function PengumumanSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <div className="flex-1">
            <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-8"><Skeleton className="h-8 w-full mb-5" /><Skeleton className="h-72 w-full mb-6" /><Skeleton className="h-8 w-3/4 mb-4" /><Skeleton className="h-48 w-full" /></div>}>
          <SlugContent params={params} />
        </Suspense>
      </div>
      <PublicFooter />
    </div>
  );
}

function SlugContent({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 15+ exposes dynamic route params as a promise.
  const { slug } = use(params);
  return <PengumumanContent initialSlug={slug} />;
}
