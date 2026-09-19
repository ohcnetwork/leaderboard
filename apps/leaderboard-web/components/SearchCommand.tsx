"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface SearchItem {
  title: string;
  href: string;
  group: string;
  keywords?: string[];
}

interface SearchCommandProps {
  items: SearchItem[];
}

export default function SearchCommand({ items }: SearchCommandProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const groups = Array.from(new Set(items.map((item) => item.group)));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and contributors..." />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {groups.map((group) => {
          const groupItems = items.filter((item) => item.group === group);

          return (
            <CommandGroup key={group} heading={group}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={[item.title, ...(item.keywords ?? [])].join(" ")}
                  onSelect={() => handleSelect(item.href)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
