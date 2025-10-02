import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
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
    axios.post("https://chatgpt-project-v26f.onrender.com/auth/register",{
      fullName:{
        firstName:formData.fullName.firstName,
        lastName:formData.fullName.lastName
      },
      email:formData.email,
      password:formData.password
    },{
      withCredentials:true
    }).then((res)=>{
      console.log("Registered succesfully");
      navigate("/")
    }).catch((err)=>{
      console.log("error occoured in registering");
      console.log(err);
      
      
    })
    console.log(formData);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
        isDark ? 'bg-gray-900' : 'bg-gray-100'
      } transition-colors duration-300`}>
      <ThemeToggle />
      <div className={`max-w-md w-full space-y-8 p-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 ${
        isDark
          ? 'bg-gray-800 shadow-cyan-500/20'
          : 'bg-white shadow-indigo-500/20'
      } backdrop-blur-lg`}>
        <div>
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full animate-pulse"></div>
            <div className={`absolute inset-1 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <svg
                className={`w-12 h-12 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}
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
          <h2 className={`mt-6 text-center text-4xl font-extrabold ${
            isDark ? 'text-cyan-400' : 'text-indigo-600'
          } transition-colors duration-300`}>
            Create Account
          </h2>
          <p className={`mt-2 text-center text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Already have an account?{' '}
            <Link to="/login" className={`font-medium ${
              isDark
                ? 'text-cyan-400 hover:text-cyan-300'
                : 'text-indigo-600 hover:text-indigo-500'
            } transition-colors duration-300`}>
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={`appearance-none relative block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-300 ${
                    isDark
                      ? 'border-gray-700 text-white bg-gray-700 placeholder-gray-400 focus:ring-cyan-400'
                      : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500 focus:ring-indigo-400'
                  }`}
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
                  className={`appearance-none relative block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-300 ${
                    isDark
                      ? 'border-gray-700 text-white bg-gray-700 placeholder-gray-400 focus:ring-cyan-400'
                      : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500 focus:ring-indigo-400'
                  }`}
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
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none relative block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-300 ${
                  isDark
                    ? 'border-gray-700 text-white bg-gray-700 placeholder-gray-400 focus:ring-cyan-400'
                    : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500 focus:ring-indigo-400'
                }`}
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-300 ${
                  isDark
                    ? 'border-gray-700 text-white bg-gray-700 placeholder-gray-400 focus:ring-cyan-400'
                    : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500 focus:ring-indigo-400'
                }`}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transform hover:scale-105 transition-all duration-300"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-cyan-300 group-hover:text-cyan-200"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                  />
                  <path
                    fillRule="evenodd"
                    d="M4 8v1a6 6 0 1012 0V8H4zm2-6a8 8 0 00-2 15.547V14h12v3.547A8 8 0 004 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;