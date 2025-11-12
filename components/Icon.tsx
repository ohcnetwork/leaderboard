import { icons } from "@/app/icons.gen";
import { LucideProps } from "lucide-react";

type IconProps = {
  name: keyof typeof icons;
} & LucideProps;

function Icon({ name, ...props }: IconProps) {
  const IconComponent = icons[name];

  if (!IconComponent) {
    throw new Error(`Icon ${name} not found in icons.gen.ts`);
  }

  return <IconComponent {...props} />;
}

export default Icon;
