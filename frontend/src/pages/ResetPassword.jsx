import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function ResetPassword() {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const { token } = useParams();

    const onSubmit = async (data) => {
        try {
            await api.put(`/auth/reset-password/${token}`, { password: data.password });
            toast.success('Password reset successful. Please log in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset failed. The link may have expired.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Set a New Password</h2>
                <p className="text-sm text-center text-gray-600">This link expires 15 minutes after it was sent.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">New Password</label>
                        <input
                            type="password"
                            {...register('password', {
                                required: 'Password is required',
                                pattern: {
                                    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                                    message: 'Must be 8+ characters with a letter, a number, and a special character (@$!%*#?&).',
                                },
                            })}
                            className="w-full p-2 border rounded focus:outline-blue-500"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Confirm Password</label>
                        <input
                            type="password"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) => value === watch('password') || 'Passwords do not match',
                            })}
                            className="w-full p-2 border rounded focus:outline-blue-500"
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && <span className="text-sm text-red-500">{errors.confirmPassword.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full p-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <p className="text-center text-sm">
                    <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
                </p>
            </div>
        </div>
    );
}
