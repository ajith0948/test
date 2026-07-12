import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            await api.post('/auth/signup', data);
            toast.success('Account created! Check your email (and spam folder) for the OTP.');

            // Redirect to the OTP page and pass the email in the URL
            navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Join AssetFlow</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Full Name</label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            className="w-full p-2 border rounded focus:outline-blue-500"
                            placeholder="John Doe"
                        />
                        {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            className="w-full p-2 border rounded focus:outline-blue-500"
                            placeholder="john@example.com"
                        />
                        {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                            className="w-full p-2 border rounded focus:outline-blue-500"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="text-sm text-red-500">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="w-full p-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700">
                        Sign Up
                    </button>
                </form>
                <p className="text-center text-sm">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}