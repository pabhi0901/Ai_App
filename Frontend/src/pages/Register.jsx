import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import axios from 'axios';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: {
      firstName: '',
      lastName: '',
    },
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/auth/register",{
      fullName:{
        firstName:formData.fullName.firstName,
        lastName:formData.fullName.lastName
      },
      email:formData.email,
      password:formData.password
    },{
      withCredentials:true
    }).then(()=>{
      console.log("Registered succesfully");
      navigate("/")
    }).catch((err)=>{
      console.log("error occoured in registering");
      console.log(err);
    })
    console.log(formData);
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <h2 className="auth-title">
            Create Account
          </h2>
          <p className="auth-subtitle">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <div className="auth-form-row">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="auth-input"
                  placeholder="First Name"
                  value={formData.fullName.firstName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: { ...formData.fullName, firstName: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="auth-input"
                  placeholder="Last Name"
                  value={formData.fullName.lastName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: { ...formData.fullName, lastName: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
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
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;