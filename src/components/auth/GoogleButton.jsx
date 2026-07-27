import { FcGoogle } from "react-icons/fc";

const GoogleButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md"
    >
      <FcGoogle size={22} />
      Continue with Google
    </button>
  );
};

export default GoogleButton;
