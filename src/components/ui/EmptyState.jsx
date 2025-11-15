
export default function EmptyState({ title, description }) {
  return (
    <div className="text-center text-sm text-slate-500 py-8">
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1">{description}</p>}
    </div>
  );
}
