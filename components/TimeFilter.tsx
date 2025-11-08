"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeFilterProps {
  currentFilter: string;
}

export function TimeFilter({ currentFilter }: TimeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const filters = [
    { value: "all-time", label: "All Time" },
    { value: "yearly", label: "This Year" },
    { value: "monthly", label: "This Month" },
    { value: "weekly", label: "This Week" },
  ];

  const handleFilterChange = (value: string) => {
    const basePath = pathname.split("/").slice(0, 2).join("/");
    router.push(`${basePath}/${value}`);
  };

  return (
    <Tabs value={currentFilter} onValueChange={handleFilterChange}>
      <TabsList>
        {filters.map((filter) => (
          <TabsTrigger key={filter.value} value={filter.value}>
            {filter.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

