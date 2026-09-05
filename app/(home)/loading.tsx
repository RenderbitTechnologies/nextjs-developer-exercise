export default function HomeLoading() {
  return (
    <div className="mx-auto min-h-svh w-full px-4 pb-10 sm:w-9/12 sm:px-0 mt-5">
      <div className="grid grid-cols-1 gap-6 lg:h-[min(36rem,calc(100svh-12rem))] lg:grid-cols-3 lg:grid-rows-2">
        <div className="h-56 rounded-2xl bg-muted lg:col-span-2 lg:row-span-2 lg:h-auto" />
        <div className="h-40 rounded-2xl bg-muted lg:h-auto" />
        <div className="h-40 rounded-2xl bg-muted lg:h-auto" />
      </div>
    </div>
  );
}
