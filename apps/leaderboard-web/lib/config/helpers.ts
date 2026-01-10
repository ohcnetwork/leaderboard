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
