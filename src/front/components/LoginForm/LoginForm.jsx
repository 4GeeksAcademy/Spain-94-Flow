import React, { useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordModal } from "../ForgotPasswordModal/ForgotPasswordModal";

import "./LoginForm.css";

export const LoginForm = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

            const response = await fetch(`${backendUrl}api/login`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            console.log("Login response:", data);

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            const token = data.access_token || data.acces_token || data.token;
            if (!token) {
                console.error("Token not found in response:", data);
                throw new Error("Token not found in response");
            }

            dispatch({
                type: "login",
                payload: {
                    token: token,
                    user: data.user
                }
            });

            console.log("State after login:", {
                token,
                user: data.user
            });

            setTimeout(() => {
                navigate("/business");
            }, 100);

        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="form-login-container">
            <div className="form-header">
                <h2>Sign in</h2>
                <p>Enter your credentials to access the system</p>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Username</label>
                    <div className="input-group">
                        <span className="input-icon">
                            <i className="bi bi-person"></i>
                        </span>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="password-label-row">
                        <label htmlFor="password" className="form-label">Password</label>
                        <a href="#" className="forgot-password" data-bs-toggle="modal" data-bs-target="#forgotPasswordModal">
                            Forgot your password?
                        </a>
                    </div>
                    <div className="input-group">
                        <span className="input-icon">
                            <i className="bi bi-lock"></i>
                        </span>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : "Sign In"}
                </button>
            </form>

            <div className="login-footer-text">
                <p>Don't have an account?<a href="#"> Contact the administrator</a></p>
            </div>
            
            <ForgotPasswordModal />
        </div>
    );
};