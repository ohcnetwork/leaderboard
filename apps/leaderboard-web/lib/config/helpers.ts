import { getConfig } from "@/lib/config/get-config";

/**
 * Get list of hidden role keys from the configuration
 * @returns Array of role keys that have hidden: true
 */
export function getHiddenRoles(): string[] {
  const config = getConfig();
  return Object.entries(config.leaderboard.roles)
    .filter(([, role]) => role.hidden === true)
    .map(([key]) => key);
}

/**
 * Get list of visible role keys from the configuration
 * @returns Array of role keys that are not hidden
 */
export function getVisibleRoles(): string[] {
  const config = getConfig();
  return Object.entries(config.leaderboard.roles)
    .filter(([, role]) => role.hidden !== true)
    .map(([key]) => key);
}

/**
 * Get a mapping of role slugs to their display names
 */
export function getRoleNames(): Record<string, string> {
  const config = getConfig();
  return Object.fromEntries(
    Object.entries(config.leaderboard.roles).map(([key, role]) => [key, role.name]),
  );
}

/**
 * Get visible roles with full metadata, preserving config.yaml insertion order
 */
export function getVisibleRolesOrdered(): Array<{
  key: string;
  name: string;
  description?: string;
}> {
  const config = getConfig();
  return Object.entries(config.leaderboard.roles)
    .filter(([, role]) => role.hidden !== true)
    .map(([key, role]) => ({
      key,
      name: role.name,
      description: role.description,
    }));
}
