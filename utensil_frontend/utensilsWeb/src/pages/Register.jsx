// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  // State for UI toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // 1. Make the function async
    const handleSignUp = async (e) => {
      e.preventDefault();

      // Grab the values from the form
      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        // 2. Call the Spring Boot API
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: fullName,
            email: email,
            password: password
          })
        });

        // 3. Handle the response
        if (response.ok) {
          alert("Account created successfully in the database! You can now log in.");
          window.location.href = '/login'; // Redirect to login page
        } else {
          // If the backend sends a 400 Bad Request (like "Email already taken")
          const errorMessage = await response.text();
          alert(`Registration failed: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Error connecting to backend:", error);
        alert("Could not connect to the server. Is Spring Boot running?");
      }
    };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* STEP 1: Registration Form */}
        {!isVerifying ? (
          <>
            <h2>Create an Account</h2>
            <p>Join us to shop the best kitchenware.</p>

            {/* Google Sign Up Button */}
            <button className="social-btn google-btn">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google logo"
                className="google-icon"
              />
              Continue with Google
            </button>

            <div className="auth-divider">
              <span>OR SIGN UP WITH EMAIL</span>
            </div>

            <form className="auth-form" onSubmit={handleSignUp}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input type="text" id="fullName" placeholder="John Doe" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="Enter your email" required />
              </div>

              {/* Password Field with Eye Icon */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field with Eye Icon */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn">Sign Up</button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Log in here</Link></p>
            </div>
          </>
        ) : (

          /* STEP 2: Email Verification UI */
          <div className="verification-step">
            <h2>Verify Your Email</h2>
            <p>We've sent a 6-digit code to your email address. Please enter it below to verify your account.</p>

            <form className="auth-form" onSubmit={handleVerification}>
              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                  style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem' }}
                />
              </div>
              <button type="submit" className="auth-submit-btn">Verify Account</button>
            </form>

            <div className="auth-footer">
              <p>Didn't receive the code? <button className="resend-btn" onClick={() => alert("Code resent!")}>Resend</button></p>
              <button className="back-btn" onClick={() => setIsVerifying(false)}>Back to Sign Up</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Register;