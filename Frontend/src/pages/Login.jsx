import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import  axios  from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${import.meta.env.VITE_API_URL}/auth/login`);
    
    setIsLoading(true);
    setErrorMessage(''); // Clear previous error
    
    axios.post(`${import.meta.env.VITE_API_URL}/auth/login`,{
      email:formData.email,
      password:formData.password
    },{
      withCredentials:true
    }).then(()=>{
      // backend sets cookies (loginStatus + token). Some environments
      // may block or delay cookies, so set a small local fallback marker
      // to let the frontend update immediately.
      try { localStorage.setItem('token','1'); } catch { /* ignore */ }

      toast.success('Login successful! Redirecting...', {
        position: "top-right",
        autoClose: 3000,
      });

      // console.log("Logged in succesfully");
      setTimeout(() => navigate("/"), 2000);
    }).catch((error)=>{
      console.log("Error in login, check the entries");
      
      const errMsg = error.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMessage(errMsg);
      
      toast.error(errMsg, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Clear form fields
      setFormData({
        email: '',
        password: '',
      });
      
      setIsLoading(false);
    })

    console.log(formData)
  };

  return (
    <div className="auth-container">
      <ToastContainer />
      {/* Theme toggle positioned at top-right */}
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-grid">
        <aside className="auth-hero" aria-hidden>
          <div className="auth-hero-inner">
            <div className="auth-hero-title">Weirwood</div>
            <p className="auth-hero-sub">Your intelligent conversation partner — fast, private, and secure.</p>
            <div className="auth-hero-visual">
              {/* Animated SVG: two curves that meet and reveal a core circle */}
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
                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                  />
                </svg>
              </div>
              <div className="auth-brand">
                <h2 className="auth-title">Welcome Back</h2>
              </div>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
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
                      Signing in...
                    </span>
                  ) : (
                    <>
                      <svg className="auth-submit-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M4 8v1a6 6 0 1012 0V8H4zm2-6a8 8 0 00-2 15.547V14h12v3.547A8 8 0 004 2z" clipRule="evenodd" />
                      </svg>
                      Sign in
                    </>
                  )}
                </button>
              </div>

              <p className="auth-help">Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;