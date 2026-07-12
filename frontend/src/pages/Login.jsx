import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loginType, setLoginType] = useState('employee'); // 'employee' or 'admin'

    const onSubmit = async (data) => {
        try {
            let response;
            if (loginType === 'admin') {
                response = await api.post('/auth/admin-login', { adminPass: data.adminPass });
            } else {
                response = await api.post('/auth/login', { email: data.email, password: data.password });
            }
            
            // Save token and role to localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userRole', response.data.role);
            }
            
            toast.success(`Welcome back, ${response.data.name}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">AssetFlow Login</h2>

                <div className="flex justify-center space-x-4 mb-4">
                    <button 
                        onClick={() => setLoginType('employee')}
                        className={`px-4 py-2 rounded font-bold ${loginType === 'employee' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Employee
                    </button>
                    <button 
                        onClick={() => setLoginType('admin')}
                        className={`px-4 py-2 rounded font-bold ${loginType === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {loginType === 'employee' ? (
                        <>
                            <div>
                                <label className="block mb-1 font-medium">Email</label>
                                <input
                                    type="email"
                                    {...register('email', { required: loginType === 'employee' ? 'Email is required' : false })}
                                    className="w-full p-2 border rounded focus:outline-blue-500"
                                    placeholder="john@example.com"
                                />
                                {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="font-medium">Password</label>
                                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    {...register('password', { required: loginType === 'employee' ? 'Password is required' : false })}
                                    className="w-full p-2 border rounded focus:outline-blue-500"
                                    placeholder="••••••••"
                                />
                                {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block mb-1 font-medium">Admin Secret</label>
                            <input
                                type="password"
                                {...register('adminPass', { required: loginType === 'admin' ? 'Admin Secret is required' : false })}
                                className="w-full p-2 border rounded focus:outline-blue-500"
                                placeholder="Admin Password"
                            />
                            {errors.adminPass && <span className="text-sm text-red-500">{errors.adminPass.message}</span>}
                        </div>
                    )}

                    <button type="submit" className="w-full p-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700">
                        Log In
                    </button>
                </form>
                {loginType === 'employee' && (
                    <p className="text-center text-sm">
                        New here? <Link to="/signup" className="text-blue-600 hover:underline">Create an account</Link>
                    </p>
                )}
            </div>
        </div>
    );
}