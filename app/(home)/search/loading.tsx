export default function SearchLoading() {
  return (
    <div className="mx-auto min-h-svh w-full px-4 pb-10 sm:w-9/12 sm:px-0 mt-5">
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-8 w-32 rounded bg-muted" />
        <div className="h-4 w-56 rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-6">
        <div className="h-11 rounded-2xl bg-muted" />
        <div className="h-8 w-48 rounded-2xl bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2 p-2">
              <div className="h-75 rounded-2xl bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-6 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
