import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import AuthCard from '../components/common/AuthCard';

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
        <AuthCard
            title="Set a new password"
            subtitle="This link expires 15 minutes after it was sent."
            footer={<Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">Back to login</Link>}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="field-label">New password</label>
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
                    {errors.password && <p className="field-error">{errors.password.message}</p>}
                </div>

                <div>
                    <label className="field-label">Confirm password</label>
                    <input
                        type="password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === watch('password') || 'Passwords do not match',
                        })}
                        className="field-input"
                        placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting ? 'Resetting…' : 'Reset password'}
                </button>
            </form>
        </AuthCard>
    );
}
