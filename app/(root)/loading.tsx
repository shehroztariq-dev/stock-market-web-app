export default function Loading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading">
      <div className="skeleton h-9 w-64 rounded-lg" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="skeleton h-[420px] rounded-xl lg:col-span-1" />
        <div className="skeleton h-[420px] rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}
