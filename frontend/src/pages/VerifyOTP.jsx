import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import AuthCard from '../components/common/AuthCard';

export default function VerifyOTP() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Grab the email from the URL so the user doesn't have to type it again
    const email = searchParams.get('email');

    const onSubmit = async (data) => {
        try {
            await api.post('/auth/verify-email', { email, otp: data.otp });
            toast.success('Email verified successfully! You can now log in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        }
    };

    return (
        <AuthCard
            title="Verify your email"
            subtitle={
                <>
                    We sent a 6-digit code to <span className="font-medium text-slate-700">{email}</span>.
                    <br />
                    <span className="text-xs text-slate-400">If you don't see it, check your spam folder.</span>
                </>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="field-label">6-digit code</label>
                    <input
                        type="text"
                        maxLength="6"
                        {...register('otp', {
                            required: 'Code is required',
                            minLength: { value: 6, message: 'Code must be 6 digits' },
                        })}
                        className="field-input text-center text-2xl tracking-[0.5em]"
                        placeholder="000000"
                    />
                    {errors.otp && <p className="field-error">{errors.otp.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting ? 'Verifying…' : 'Verify account'}
                </button>
            </form>
        </AuthCard>
    );
}
