import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import  axios  from 'axios';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    axios.post("http://localhost:5000/auth/login",{
      email:formData.email,
      password:formData.password
    },{
      withCredentials:true
    }).then((res)=>{
      console.log("Logged in succesfully");
      navigate("/")
    }).catch((res)=>{
      console.log("Error in login, check the entries");
      
    })

    console.log(formData)
  };

  return (
    <div className="auth-container">
      {/* Theme toggle positioned at top-right */}
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      
      <div className="auth-form-container">
        <div>
          <div className="auth-logo-container">
            <div className="auth-logo-bg"></div>
            <div className="auth-logo-inner">
              <svg
                className="auth-logo-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
          </div>
          <h2 className="auth-title">
            Welcome Back
          </h2>
          <p className="auth-subtitle">
            {"Don't have an account? "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="auth-input"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="auth-input"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="auth-form-group">
            <button type="submit" className="auth-submit-btn">
              <svg className="auth-submit-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M4 8v1a6 6 0 1012 0V8H4zm2-6a8 8 0 00-2 15.547V14h12v3.547A8 8 0 004 2z" clipRule="evenodd" />
              </svg>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;