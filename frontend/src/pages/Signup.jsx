import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import AuthCard from '../components/common/AuthCard';

export default function Signup() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
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
        <AuthCard
            title="Create your account"
            footer={<>Already have an account? <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">Log in</Link></>}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="field-label">Full name</label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        className="field-input"
                        placeholder="John Doe"
                    />
                    {errors.name && <p className="field-error">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="field-label">Email</label>
                    <input
                        type="email"
                        {...register('email', { required: 'Email is required' })}
                        className="field-input"
                        placeholder="john@example.com"
                    />
                    {errors.email && <p className="field-error">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="field-label">Password</label>
                    <input
                        type="password"
                        {...register('password', {
                            required: 'Password is required',
                            pattern: {
                                value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                                message: 'Must be 8+ characters with a letter, a number, and a special character (@$!%*#?&).',
                            },
                        })}
                        className="field-input"
                        placeholder="••••••••"
                    />
                    {errors.password ? (
                        <p className="field-error">{errors.password.message}</p>
                    ) : (
                        <p className="mt-1 text-xs text-slate-400">8+ characters, with a letter, a number, and a special character.</p>
                    )}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting ? 'Creating account…' : 'Sign up'}
                </button>
            </form>
        </AuthCard>
    );
}
