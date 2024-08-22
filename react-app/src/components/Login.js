import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-logo">
        <img src="/logo.png" alt="logo" />
      </div>
      <h1>Welcome!</h1>
      <form>
        <div className="input-container">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Email" required />
        </div>
        <div className="input-container">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Password" required />
        </div>
        <button type="submit" className="login-button">Log In</button>
      </form>
      <div className="login-footer">
        <a href="/forgot-password">Forgot your password?</a>
        <p>Don't have an account? <a href="/signup">Sign Up!</a></p>
      </div>
    </div>
  );
};

export default Login;

