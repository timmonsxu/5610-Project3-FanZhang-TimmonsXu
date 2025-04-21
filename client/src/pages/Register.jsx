import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";
import "../styles/register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("FormData updated:", formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed - ${name}:`, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Submit - FormData:", formData);
    console.log("Submit - Password:", formData.password);
    console.log("Submit - Confirm Password:", formData.confirmPassword);
    console.log(
      "Submit - Are they equal?",
      formData.password === formData.confirmPassword
    );
    console.log("Submit - Password length:", formData.password.length);
    console.log(
      "Submit - Confirm Password length:",
      formData.confirmPassword.length
    );

    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    if (password !== confirmPassword) {
      setError(
        `Passwords do not match. Password: "${password}", Confirm: "${confirmPassword}"`
      );
      setLoading(false);
      return;
    }

    try {
      await userService.register({
        username: formData.username,
        password: password,
        confirmPassword: confirmPassword,
      });
      alert("Registration successful! Please login with your new account.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
