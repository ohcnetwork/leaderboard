export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-gray-300 bg-background text-foreground dark:border-gray-700">
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}
