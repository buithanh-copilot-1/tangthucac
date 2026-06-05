function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

export function StoryListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3">
          <Block className="h-24 w-16 flex-shrink-0 rounded-xl" />
          <div className="flex-1 min-w-0 py-1">
            <Block className="h-4 w-3/4" />
            <Block className="mt-3 h-3 w-1/2" />
            <Block className="mt-4 h-3 w-full" />
            <Block className="mt-2 h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="px-4 py-5">
      <Block className="h-44 w-full rounded-2xl" />
      <div className="mt-6 flex items-center justify-between">
        <Block className="h-5 w-28" />
        <Block className="h-4 w-16" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Block className="aspect-[2/3] w-full rounded-xl" />
            <Block className="mt-2 h-3 w-full" />
            <Block className="mt-1.5 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StoryDetailSkeleton() {
  return (
    <div className="px-4 py-5">
      <Block className="h-48 w-full rounded-b-2xl" />
      <div className="-mt-10 flex gap-4">
        <Block className="h-36 w-24 rounded-xl" />
        <div className="flex-1 pt-12">
          <Block className="h-5 w-4/5" />
          <Block className="mt-3 h-4 w-1/2" />
          <Block className="mt-4 h-7 w-32 rounded-full" />
        </div>
      </div>
      <Block className="mt-5 h-16 w-full rounded-xl" />
      <Block className="mt-5 h-28 w-full rounded-xl" />
      <Block className="mt-5 h-12 w-full rounded-xl" />
    </div>
  );
}

export function ChapterSkeleton() {
  return (
    <div className="min-h-screen bg-white px-5 pt-20">
      <Block className="mx-auto h-6 w-2/3" />
      <div className="mt-10 space-y-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Block key={i} className={`h-4 ${i % 3 === 0 ? 'w-5/6' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}
