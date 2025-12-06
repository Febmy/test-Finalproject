// src/components/ui/Skeleton.jsx
export default function Skeleton({
  className = "",
  count = 1,
  type = "text",
  width,
  height,
}) {
  const getDefaultDimensions = () => {
    switch (type) {
      case "text":
        return "h-4";
      case "title":
        return "h-6";
      case "image":
        return "h-48";
      case "card":
        return "h-64";
      case "avatar":
        return "h-10 w-10 rounded-full";
      case "button":
        return "h-10 w-24";
      default:
        return "h-4";
    }
  };

  const skeletonItems = Array.from({ length: count }).map((_, i) => {
    const baseClasses = "animate-pulse bg-slate-200 rounded";
    const dimensionClass =
      width || height
        ? `${height || "h-4"} ${width || "w-full"}`
        : getDefaultDimensions();

    return (
      <div
        key={i}
        className={`${baseClasses} ${dimensionClass} ${className}`}
        style={{
          width: width,
          height: height,
        }}
      />
    );
  });

  if (count === 1) {
    return skeletonItems[0];
  }

  return <div className="space-y-2">{skeletonItems}</div>;
}

// Pre-configured skeleton components
export const ActivitySkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
    <Skeleton type="image" className="rounded-xl" />
    <Skeleton type="title" className="w-3/4" />
    <Skeleton type="text" className="w-full" />
    <Skeleton type="text" className="w-2/3" />
    <div className="flex justify-between">
      <Skeleton type="button" />
      <Skeleton type="button" />
    </div>
  </div>
);

export const PromoSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
    <Skeleton type="title" className="w-1/2" />
    <Skeleton type="text" count={2} />
    <div className="flex gap-2">
      <Skeleton type="button" className="w-16 h-6" />
      <Skeleton type="button" className="w-20 h-6" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <Skeleton type="title" className="w-48 h-8" />
    <Skeleton type="text" className="w-64" />

    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton type="avatar" className="w-20 h-20" />
        <div className="flex-1 space-y-2">
          <Skeleton type="title" className="w-40" />
          <Skeleton type="text" className="w-56" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton type="text" className="w-24" />
            <Skeleton type="text" className="w-full h-10" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
