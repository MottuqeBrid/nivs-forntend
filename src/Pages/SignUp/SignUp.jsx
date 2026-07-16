import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../lib/axiosInstance";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting:", { name, email, password });

    try {
      const { data } = await axiosInstance.post("users/signup", {
        name,
        email,
        password,
      });
      if (data.success) {
        await login(data.token, true); // Automatically log in after signup
        toast.success(data.message);
        navigate("/");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4">
      <div className="card bg-base-200 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-2">
            Sign Up
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Name</span>
              </label>
              <div className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary w-full">
                <HiUser className="text-lg opacity-60 shrink-0" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="bg-transparent outline-none w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary w-full">
                <HiMail className="text-lg opacity-60 shrink-0" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="bg-transparent outline-none w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary w-full">
                <HiLockClosed className="text-lg opacity-60 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs shrink-0"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <HiEyeOff className="text-lg opacity-60" />
                  ) : (
                    <HiEye className="text-lg opacity-60" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="divider text-sm">OR</div>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
