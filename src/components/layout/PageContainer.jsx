// src/components/layout/PageContainer.jsx
export default function PageContainer({ children }) {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">{children}</div>
    </main>
  );
}
