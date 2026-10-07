// A public project page (/projects/:projectId): the one public page a sign-in can return to ("Sign in to donate").
const PUBLIC_PROJECT_PAGE = /^\/projects\/[^/]+$/;

/**
 * Where to go after signing in. `from` is the path that sent the person to the login page (router state, never
 * a URL parameter): a page of their own portal, or a public project page. Anything else: their dashboard.
 * Used by the login form and by GuestRoute, which both react to the same sign-in and must agree.
 */
export const returnPathAfterLogin = (from, role) =>
  typeof from === "string" && (from.startsWith(`/dashboard/${role}`) || PUBLIC_PROJECT_PAGE.test(from)) ? from : `/dashboard/${role}`;
