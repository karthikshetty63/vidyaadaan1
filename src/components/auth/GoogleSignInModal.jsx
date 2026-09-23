import Button from "../ui/Button";
import Modal from "../ui/Modal";

// DEMO ONLY — Google Sign-In is NOT implemented.
// This modal intentionally does not sign anyone in or navigate anywhere.
// Real Google OAuth must be verified on the backend before it can replace this.
const GoogleSignInModal = ({ isOpen, onClose }) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    size="sm"
    title="Sign in with Google"
    description="Demo · not available yet"
    footer={<Button onClick={onClose} data-autofocus>Use email &amp; password</Button>}
  >
    <p className="text-sm text-slate-600">
      Google Sign-In is a <strong className="font-semibold text-slate-900">demo feature</strong> and is not available yet.
      Please sign in with your email and password.
    </p>
  </Modal>
);

export default GoogleSignInModal;
