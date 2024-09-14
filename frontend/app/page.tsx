"use client";

import { useState } from "react";
import { EventLog } from "@/components/EventLog";
import { FinalOutput } from "@/components/FinalOutput";
import InputSection from "@/components/InputSection";
import { useCrewOutput } from "@/hooks/useCrewOutput";

export default function Home() {
  // State for login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Hooks for multi-agent crew output
  const crewOutput = useCrewOutput();

  // Login handler
  const handleLogin = async () => {
    setLoginError(""); // Reset any previous error messages
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setIsLoggedIn(true); // Set login state to true on success
      } else {
        const errorData = await response.json();
        setLoginError(errorData.description || "Login failed");
      }
    } catch (error) {
      setLoginError("An error occurred while logging in.");
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsLoggedIn(false); // Set login state to false on success
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="bg-white min-h-screen text-black">
      <div className="flex flex-col">
        {/* Conditional rendering based on login state */}
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            {loginError && <p className="text-red-500">{loginError}</p>}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleLogin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end p-4">
              <button
                onClick={handleLogout}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>

            {/* Input sections */}
            <div className="flex w-full">
              <div className="w-1/2 p-4">
                <InputSection
                  title="Technologies"
                  placeholder="Example: Generative AI"
                  data={crewOutput.technologies}
                  setData={crewOutput.setTechnologies}
                />
              </div>
              <div className="w-1/2 p-4">
                <InputSection
                  title="Business Areas"
                  placeholder="Example: Customer Service"
                  data={crewOutput.businessareas}
                  setData={crewOutput.setBusinessareas}
                />
              </div>
            </div>

            {/* Output section and event log */}
            <div className="flex flex-col w-full p-4">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => crewOutput.startOutput()}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                  disabled={crewOutput.running}
                >
                  {crewOutput.running ? "Running..." : "Start"}
                </button>
              </div>
              <FinalOutput businessareaInfoList={crewOutput.businessareaInfoList} />
              <div className="my-8">
                <EventLog events={crewOutput.events} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
