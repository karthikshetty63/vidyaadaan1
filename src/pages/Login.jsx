import { useSearchParams, Link } from "react-router-dom";
import GoogleButton from "../components/auth/GoogleButton";

const Login = () => {
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role") || "school";

  const roleName = {
    school: "🏫 School Administrator",
    donor: "❤️ Donor",
    ngo: "🤝 NGO",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <div className="text-center">

          <h1 className="text-3xl font-bold text-orange-600">
            VIDYADAAN
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome Back
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
              placeholder="Enter your password"
              className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember Me
            </label>

            <button
              type="button"
              className="text-orange-600 hover:underline"
            >
              Forgot Password?
            </button>

          </div>

          <button
            className="w-full rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            Login
          </button>

        </form>

        <p className="mt-6 text-center text-gray-600">

          Don't have an account?

          <Link
            to={`/register?role=${role}`}
            className="ml-2 font-semibold text-orange-600 hover:underline"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Login;