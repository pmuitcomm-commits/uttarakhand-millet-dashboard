/**
 * Authentication navigation helpers for role-specific landing pages.
 *
 * This module keeps post-login routing consistent across login, top bar, and
 * protected officer workflows.
 */

/**
 * Resolve the first page a user should see after authentication.
 *
 * @param {string} role - Normalized user role returned by the API.
 * @returns {string} Route path for the role-specific landing page.
 */
export function getPostLoginPath(role) {
  switch (role) {
    case "admin":
      return "/admin-landing";
    case "district":
      return "/district-landing";
    case "block":
      return "/block-landing";
    default:
      return "/procurement";
  }
}
