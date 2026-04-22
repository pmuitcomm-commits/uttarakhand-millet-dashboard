export function getPostLoginPath(role) {
  switch (role) {
    case "admin":
      return "/admin-landing";
    case "district_officer":
      return "/district-landing";
    case "block_officer":
      return "/block-landing";
    default:
      return "/procurement";
  }
}
