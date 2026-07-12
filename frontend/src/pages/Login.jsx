import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import AuthCard from '../components/common/AuthCard';

export default function Login() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
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
        <AuthCard
            title="Sign in to your account"
            footer={
                loginType === 'employee' && (
                    <>New here? <Link to="/signup" className="font-medium text-brand-700 hover:text-brand-800">Create an account</Link></>
                )
            }
        >
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
                <button
                    type="button"
                    onClick={() => setLoginType('employee')}
                    className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                        loginType === 'employee' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Employee
                </button>
                <button
                    type="button"
                    onClick={() => setLoginType('admin')}
                    className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                        loginType === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Admin
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {loginType === 'employee' ? (
                    <>
                        <div>
                            <label className="field-label">Email</label>
                            <input
                                type="email"
                                {...register('email', { required: loginType === 'employee' ? 'Email is required' : false })}
                                className="field-input"
                                placeholder="john@example.com"
                            />
                            {errors.email && <p className="field-error">{errors.email.message}</p>}
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="field-label !mb-0">Password</label>
                                <Link to="/forgot-password" className="text-xs font-medium text-brand-700 hover:text-brand-800">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                {...register('password', { required: loginType === 'employee' ? 'Password is required' : false })}
                                className="field-input"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="field-error">{errors.password.message}</p>}
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="field-label">Admin Secret</label>
                        <input
                            type="password"
                            {...register('adminPass', { required: loginType === 'admin' ? 'Admin secret is required' : false })}
                            className="field-input"
                            placeholder="Admin password"
                        />
                        {errors.adminPass && <p className="field-error">{errors.adminPass.message}</p>}
                    </div>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting ? 'Signing in…' : 'Log in'}
                </button>
            </form>
        </AuthCard>
    );
}
