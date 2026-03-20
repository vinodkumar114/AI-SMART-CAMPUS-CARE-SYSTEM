import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-8 glass-panel p-10 relative z-10 transition-all duration-300 hover:shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-primary tracking-tight">
            Campus Guardian <span className="text-secondary">AI</span>
          </h2>
          <p className="mt-4 text-center text-sm text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-alert bg-red-50 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" required className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm transition-colors" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" required className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm transition-colors" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Sign in
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link to="/register" className="font-medium text-secondary hover:text-primary transition-colors">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
