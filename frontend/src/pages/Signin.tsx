import { SigninInput } from "@abhirajthakur/medium-common";
import axios, { AxiosError } from "axios";
import { Report } from "notiflix/build/notiflix-report-aio";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Quote } from "../components/Quote";
import { BACKEND_URL } from "../config";

export const Signin = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<SigninInput>();

  const sendSigninRequest: SubmitHandler<SigninInput> = async (data) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/signin`,
        data,
      );

      localStorage.setItem("token", response.data.token);
      navigate("/blogs");
    } catch (e) {
      if (e instanceof AxiosError && e.response) {
        Report.failure(
          "Error while signing in",
          e.response.data.error,
          "Try Again",
        );
      } else if (e instanceof AxiosError && e.request) {
        Report.failure(
          "Error while signing in",
          e.request.responseText,
          "Try Again",
        );
      } else {
        alert(e);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center p-8">
        <div className="lg:px-20 xl:px-24 2xl:px-32">
          <h2 className="text-2xl font-bold text-gray-700">
            Login to your account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Don't have an account?
            <Link className="pl-2 underline" to="/signup">
              Sign up
            </Link>
          </p>
          <form
            onSubmit={handleSubmit(sendSigninRequest)}
            className="mt-8 space-y-6"
          >
            <div>
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Email"
                type="email"
                required
                {...register("email", { required: true })}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Password"
                type="password"
                required
                {...register("password", { required: true })}
              />
            </div>
            <div className="flex justify-center items-center">
              <button
                type="submit"
                className="bg-blue-500 w-full text-white px-4 py-2 font-semibold rounded-md hover:bg-blue-400 hover:shadow-lg focus:outline-none"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden lg:block">
        <Quote />
      </div>
    </div>
  );
};