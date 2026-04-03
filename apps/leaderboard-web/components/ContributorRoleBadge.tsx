"use client";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { VariantProps } from "class-variance-authority";

export interface ContributorRoleBadgeProps
  extends
    Omit<React.ComponentProps<"span">, "children">,
    VariantProps<typeof badgeVariants> {
  role: string;
  roleName?: string;
  roleDescription?: string;
}

export function ContributorRoleBadge({
  role,
  roleName,
  roleDescription,
  variant = "secondary",
  ...props
}: ContributorRoleBadgeProps) {
  const badge = (
    <Badge variant={variant} data-contributor-role={role} {...props}>
      {roleName ?? role}
    </Badge>
  );

  if (!roleDescription) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>{roleDescription}</TooltipContent>
    </Tooltip>
  );
}
