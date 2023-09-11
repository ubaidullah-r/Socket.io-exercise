import axios from "axios";
import React, { useState } from "react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  async function register(ev) {
    ev.preventDefault();
    try {
      await axios.post('/register', { username, password });
      // Handle success
    } catch (error) {
      console.error("Error:", error);
      // Handle error (e.g., show an error message to the user)
    }
  }
  
  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={register}>
        <input
          type="text"
          value={username}
          onChange={(ev) => {
            setUsername(ev.target.value);
          }}
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          type="password"
          value={password}
          onChange={(ev) => {
            setPassword(ev.target.value);
          }}
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />

        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
