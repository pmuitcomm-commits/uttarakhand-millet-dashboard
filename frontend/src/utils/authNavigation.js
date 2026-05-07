/**
 * Authentication navigation helpers for role-specific dashboard pages.
 *
 * This module keeps post-login routing consistent across login, top bar, and
 * protected officer workflows.
 */

/**
 * Resolve the first page a user should see after authentication.
 *
 * @param {string} role - Normalized user role returned by the API.
 * @returns {string} Route path for the role-specific dashboard page.
 */
export function getPostLoginPath(role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "district":
      return "/district/officer";
    case "block":
      return "/block";
    default:
      return "/procurement";
  }
}
