import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { FcGoogle } from 'react-icons/fc';
import {useGoogleLogin} from '@react-oauth/google';
import axios from 'axios';


export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const reponseGoogle = async(authResult)=>{
    try{
      const {code} = authResult;
      console.log("authResult:",authResult);
      console.log("code:",code);
      const res = await api.post('/oauth/google',{code});
      const {token,user} = res.data;
      console.log(token,user);
      setAuth(token,user);  
      toast.success('Logged in with Google!');
      navigate('/dashboard');

    }catch(error){
      console.error("message:",error);
      toast.error('Google login failed');
    }
  }
  const handleGoogleLogin = useGoogleLogin({
      onSuccess:reponseGoogle,
      onError:reponseGoogle,
      flow:'auth-code'
  });

   const handleChange = (e) => {
     const { name, value } = e.target;
     setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e) => {
     e.preventDefault();
     setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;
      
      // Store auth data
      setAuth(token, user);
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

         <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              {loading ? 'Loggin in...' : 'Log in'}
            </button>
            <button
              type="button"
              className="mt-3 group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
               onClick={handleGoogleLogin} // Add your Google login handler here
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Log in with Google
            </button>
          </div>  
        </form>
      </div>
    </div>
  );
} 