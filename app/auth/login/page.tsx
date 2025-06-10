"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [name, setName] = useState("");
  // const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  // const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
        { email, password },
      );
      if (response.status === 200) {
        toast.success("Login successful");
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("Invalid email or password");
      toast.error("Invalid email or password");
    }
  };

  /*
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        name,
        email,
        password,
        role,
      });
      if (response.status === 200) {
        toast.success("Registration successful");
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
      toast.error(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };
  */

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 shadow-lg bg-white rounded-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">
            {/* {isRegistering ? "Register" : "Welcome Back!"} */}
            Welcome Back!
          </h2>
          <p className="text-gray-500">
            {/* {isRegistering ? "Create your account" : "Please log in to your account"} */}
            Please log in to your account
          </p>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* 
        {isRegistering ? (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              className="w-full py-2 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              type="submit"
            >
              Register
            </button>
          </form>
        ) : (
        */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            className="w-full py-2 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            type="submit"
          >
            Log In
          </button>
        </form>
        {/* )} */}

        {/* 
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setError("");
              setIsRegistering(!isRegistering);
            }}
            className="text-blue-500 hover:underline"
          >
            {isRegistering ? "Already have an account? Log in" : "Don't have an account? Register"}
          </button>
        </div>
        */}
      </div>
    </div>
  );
};

export default Auth;
