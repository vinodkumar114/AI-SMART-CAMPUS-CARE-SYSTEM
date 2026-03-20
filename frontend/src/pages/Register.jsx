import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    enrollmentYear: new Date().getFullYear(),
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/register', formData);
      // Automatically login after successful registration
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full space-y-8 glass-panel p-10 relative z-10 transition-all duration-300 hover:shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-primary tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the Campus Guardian AI platform
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="text-alert bg-red-50 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
          
          <div className="space-y-4">
            <input name="name" type="text" required className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm transition-colors" placeholder="Full Name" value={formData.name} onChange={handleChange} />
            
            <input name="email" type="email" required className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm transition-colors" placeholder="Email address" value={formData.email} onChange={handleChange} />
            
            <input name="password" type="password" required className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm transition-colors" placeholder="Password" value={formData.password} onChange={handleChange} />
            
            <select name="role" required className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm transition-colors" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="counselor">Counselor</option>
              <option value="admin">Admin</option>
            </select>

            {(formData.role === 'student' || formData.role === 'counselor') && (
              <input name="department" type="text" required className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm transition-colors" placeholder="Department (e.g., Computer Science)" value={formData.department} onChange={handleChange} />
            )}

            {formData.role === 'student' && (
              <input name="enrollmentYear" type="number" required className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm transition-colors" placeholder="Enrollment Year" value={formData.enrollmentYear} onChange={handleChange} />
            )}
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Register
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary hover:text-secondary transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
