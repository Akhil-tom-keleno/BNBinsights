import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Navigation from '@/sections/Navigation';
import SimpleFooter from '@/sections/SimpleFooter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      return;
    }

    // Verify token
    fetch(`${API_URL}/auth/verify-reset-token/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setIsValidToken(true);
        } else {
          setError('This reset link is invalid or has expired');
        }
        setIsVerifying(false);
      })
      .catch(() => {
        setError('Failed to verify reset link');
        setIsVerifying(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#F6F7F9]">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#D4A23F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6B7280]">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Header */}
      <div className="bg-[#0B0F17] pt-24 pb-12">
        <div className="w-full px-6 lg:px-[6vw]">
          <Link to="/login" className="inline-flex items-center gap-2 text-white/70 hover:text-[#D4A23F] mb-6">
            <ArrowLeft size={18} />
            Back to Sign In
          </Link>
          <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-4">
            Create New Password
          </h1>
          <p className="text-[#A7B1C2] max-w-xl">
            Enter your new password below.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="w-full px-6 lg:px-[6vw] py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 card-shadow">
            {!token || !isValidToken ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-red-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-[#0B0F17] mb-4">Invalid Reset Link</h2>
                <p className="text-[#6B7280] mb-6">
                  {error || 'This password reset link is invalid or has expired.'}
                </p>
                <Link
                  to="/forgot-password"
                  className="inline-block btn-gold py-3 px-8 rounded-xl font-semibold"
                >
                  Request New Reset Link
                </Link>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-[#0B0F17] mb-4">Password Reset Successful</h2>
                <p className="text-[#6B7280] mb-6">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <Link
                  to="/login"
                  className="inline-block btn-gold py-3 px-8 rounded-xl font-semibold"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B0F17]"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-[#6B7280]">Must be at least 6 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-gold py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      
      <SimpleFooter />
    </div>
  );
}
