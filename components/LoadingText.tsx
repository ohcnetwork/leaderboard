export default function LoadingText({ text }: { text: string }) {
  return (
    <div className="flex h-[75vh] items-center justify-center text-3xl dark:text-primary-200">
      <span>{text}</span>
      <span className="animate-[pulse_1s_infinite_100ms]">.</span>
      <span className="animate-[pulse_1s_infinite_200ms]">.</span>
      <span className="animate-[pulse_1s_infinite_300ms]">.</span>
    </div>
  );
}
