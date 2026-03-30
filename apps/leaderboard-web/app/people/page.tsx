import { Suspense } from "react";
import { getAllContributorsWithAvatars } from "@/lib/data/loader";
import { getConfig } from "@/lib/config/get-config";
import { getHiddenRoles, getVisibleRolesOrdered } from "@/lib/config/helpers";
import type { Metadata } from "next";
import PeopleView from "./PeopleView";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  const hiddenRoles = getHiddenRoles();
  const contributors = await getAllContributorsWithAvatars(hiddenRoles);

  return {
    title: `People - ${config.meta.title}`,
    description: `Meet the ${contributors.length} contributors who make ${config.org.name} possible. View all community members and their contributions.`,
    openGraph: {
      title: `People - ${config.meta.title}`,
      description: `Meet the ${contributors.length} contributors who make ${config.org.name} possible.`,
      url: `${config.meta.site_url}/people`,
      siteName: config.meta.title,
      images: [config.meta.image_url],
    },
  };
}

export default async function PeoplePage() {
  const config = getConfig();
  const hiddenRoles = getHiddenRoles();
  const contributors = await getAllContributorsWithAvatars(hiddenRoles);
  const roles = getVisibleRolesOrdered();

  return (
    <Suspense>
      <PeopleView
        contributors={contributors}
        roles={roles}
        orgName={config.org.name}
      />
    </Suspense>
  );
}
