import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setErrorMessage(''); // Clear previous error
    
    axios.post(`${import.meta.env.VITE_API_URL}/auth/register`,{
      fullName:{
        firstName:formData.fullName.firstName,
        lastName:formData.fullName.lastName
      },
      email:formData.email,
      password:formData.password
    },{
      withCredentials:true
    }).then(()=>{
      // set a small local fallback marker so frontend UI updates immediately
      try { localStorage.setItem('token','1'); } catch { /* ignore */ }
      
      toast.success('Account created successfully! Redirecting...', {
        position: "top-right",
        autoClose: 3000,
      });
      
      console.log("Registered succesfully");
      setTimeout(() => navigate("/"), 2500);
    }).catch((err)=>{
      console.log("error occoured in registering");
      console.log(err);
      
      const errMsg = err.response?.data?.message || 'Registration failed. Please check your details and try again.';
      setErrorMessage(errMsg);
      
      toast.error(errMsg, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Clear form fields
      setFormData({
        fullName: {
          firstName: '',
          lastName: '',
        },
        email: '',
        password: '',
      });
      
      setIsLoading(false);
    })
    console.log(formData);
  };

  return (
    <div className="auth-container">
      <ToastContainer />
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-grid">
        <aside className="auth-hero" aria-hidden>
          <div className="auth-hero-inner">
            <div className="auth-hero-title">AI Chat</div>
            <p className="auth-hero-sub">Create your account to start chatting with the AI.</p>
            <div className="auth-hero-visual">
              <svg className="auth-hero-svg" viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="var(--accent-primary)" />
                    <stop offset="100%" stopColor="var(--accent-secondary)" />
                  </linearGradient>
                  <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="1" />
                    <stop offset="45%" stopColor="var(--accent-primary)" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <g fill="none" stroke="url(#g1)" strokeWidth="3" strokeLinecap="round">
                  <path className="orbit orbit-1" d="M10,110 C80,20 340,20 410,110" />
                  <path className="orbit orbit-2" d="M10,130 C120,220 300,220 410,130" />
                </g>
                <circle className="core-glow" cx="210" cy="120" r="18" fill="url(#coreGrad)" />
              </svg>
            </div>
          </div>
        </aside>

        <main className="auth-form-wrapper">
          <div className="auth-form-card">
            <div className="auth-logo-row">
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
              <div className="auth-brand">
                <h2 className="auth-title">Create Account</h2>
              </div>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-row">
                <div className="field">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="auth-input floating"
                    placeholder=" "
                    value={formData.fullName.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName: { ...formData.fullName, firstName: e.target.value },
                      })
                    }
                  />
                  <label htmlFor="firstName" className="floating-label">First Name</label>
                </div>

                <div className="field">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="auth-input floating"
                    placeholder=" "
                    value={formData.fullName.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName: { ...formData.fullName, lastName: e.target.value },
                      })
                    }
                  />
                  <label htmlFor="lastName" className="floating-label">Last Name</label>
                </div>
              </div>

              <div className="field">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="auth-input floating"
                  placeholder=" "
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <label htmlFor="email" className="floating-label">Email address</label>
              </div>

              <div className="field">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="auth-input floating"
                  placeholder=" "
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <label htmlFor="password" className="floating-label">Password</label>
              </div>

              {errorMessage && (
                <div className="auth-error-message">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="error-icon">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              <div className="auth-form-group">
                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <span className="auth-loader-wrapper">
                      <span className="auth-loader"></span>
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      <svg className="auth-submit-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Create Account
                    </>
                  )}
                </button>
              </div>

              <p className="auth-help">Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Register;