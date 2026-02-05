import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/sections/Navigation';
import SimpleFooter from '@/sections/SimpleFooter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Header */}
      <div className="bg-[#0B0F17] pt-24 pb-12">
        <div className="w-full px-6 lg:px-[6vw]">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-[#D4A23F] mb-6">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-4">
            Sign In
          </h1>
          <p className="text-[#A7B1C2] max-w-xl">
            Access your BNBinsights account. For property managers and administrators.
          </p>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full px-6 lg:px-[6vw] py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 card-shadow">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Password
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B0F17]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-sm text-[#D4A23F] hover:underline">
                  Forgot password?
                </Link>
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
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#0B0F17]/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-[#6B7280]">Or</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-[#6B7280] mb-2">Don't have an account?</p>
              <Link
                to="/list-company"
                className="inline-flex items-center gap-2 text-[#D4A23F] font-semibold hover:underline"
              >
                List your company
                <ArrowLeft className="rotate-180" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <SimpleFooter />
    </div>
  );
}
