import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

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
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Verify Your Email</h2>
                <p className="text-sm text-center text-gray-600">
                    We sent a 6-digit code to <strong>{email}</strong>
                </p>
                <p className="text-xs text-center text-gray-500 mt-1">
                    (If you don't see it, please check your spam or junk folder)
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">6-Digit Code</label>
                        <input
                            type="text"
                            maxLength="6"
                            {...register('otp', {
                                required: 'Code is required',
                                minLength: { value: 6, message: 'Code must be 6 digits' }
                            })}
                            className="w-full p-2 border rounded focus:outline-blue-500 text-center text-2xl tracking-widest"
                            placeholder="000000"
                        />
                        {errors.otp && <span className="text-sm text-red-500">{errors.otp.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full p-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSubmitting ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}