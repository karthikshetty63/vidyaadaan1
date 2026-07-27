import { useSearchParams, Link } from "react-router-dom";
import GoogleButton from "../components/auth/GoogleButton";

const Register = () => {
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role") || "school";

  const roleName = {
    school: "🏫 School Administrator",
    donor: "❤️ Donor",
    ngo: "🤝 NGO",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">

        <div className="text-center">

          <h1 className="text-3xl font-bold text-orange-600">
            Join VIDYADAAN
          </h1>

          <p className="mt-2 text-gray-600">
            Create your account
          </p>

          <div className="mt-5 inline-block rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-700">
            {roleName[role]}
          </div>

        </div>

        <div className="mt-8">
          <GoogleButton />
        </div>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-b"></div>
          <span className="mx-4 text-gray-400">OR</span>
          <div className="flex-1 border-b"></div>
        </div>

        <form className="space-y-5">

          <div>
            <label className="mb-2 block font-medium">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
            />
          </div>

          <button
            className="w-full rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            Create Account
          </button>

        </form>

        <p className="mt-6 text-center text-gray-600">

          Already have an account?

          <Link
            to={`/login?role=${role}`}
            className="ml-2 font-semibold text-orange-600 hover:underline"
          >
            Login
          </Link>

        </p>

      </div>
    </div>
  );
};

export default Register;