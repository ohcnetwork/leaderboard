export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-secondary-300 bg-background text-foreground dark:border-secondary-700">
      <div className="mx-auto max-w-6xl ">{children}</div>
    </div>
  );
}
