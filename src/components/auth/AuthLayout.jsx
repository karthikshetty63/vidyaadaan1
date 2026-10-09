import AuthShell from "./AuthShell";

/**
 * The frame of the account pages that serve every portal (forgot and reset password): the same brand
 * side and card as the sign-in pages. (`image` and `quote` belonged to the earlier photo design and
 * are no longer shown.)
 */
const AuthLayout = ({ children }) => <AuthShell>{children}</AuthShell>;

export default AuthLayout;
