export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground border-t dark:border-gray-700 border-gray-300">
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}
