import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import AuthCard from '../components/common/AuthCard';

export default function ForgotPassword() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            const response = await api.post('/auth/forgot-password', data);
            toast.success(response.data.message || 'Check your email for the reset link!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        }
    };

    return (
        <AuthCard
            title="Reset your password"
            subtitle="Enter your email and we'll send you a reset link."
            footer={<Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">Back to login</Link>}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting ? 'Sending…' : 'Send reset link'}
                </button>
            </form>
        </AuthCard>
    );
}
