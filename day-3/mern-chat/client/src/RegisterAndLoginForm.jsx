import axios from "axios";
import React, { useContext, useState } from "react";
import UserContext from "./UserContext";

const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrregister, setIsLoginOrRegister] = useState("register");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrregister === 'register' ? '/register' : '/login' ;
    try {
      const { data } = await axios.post(url, { username, password });
      setLoggedInUsername(username);
      setId(data.id);
    } catch (error) {
      console.log("Error:", error);
      // Handle error (e.g., show an error message to the user)
    }
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
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
          {isLoginOrregister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrregister === "register" && (
            <div>
              Already a member?
              <button
                onClick={() => {
                  setIsLoginOrRegister("Login");
                }}
              >
                Login here
              </button>
            </div>
          )}
          {isLoginOrregister === "Login" && (
            <div>
              Dont have an account?
              <button
                onClick={() => {
                  setIsLoginOrRegister("register");
                }}
              >
                Register here
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterAndLoginForm;
