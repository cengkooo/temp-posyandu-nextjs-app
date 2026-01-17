'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Heart, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (resetError) {
        setError('Terjadi kesalahan. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-teal-100/50 p-8 border border-teal-50 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-200/50">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">Email Terkirim!</h1>
            <p className="text-gray-600 mb-6">
              Kami telah mengirim link reset password ke email Anda. Silakan cek inbox atau folder spam.
            </p>

            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg shadow-teal-200/50"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Forgot Password Card */}
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/admin/login"
          className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Kembali ke Login</span>
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-teal-100/50 p-8 border border-teal-50">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-200/50">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Lupa Password</h1>
            <p className="text-sm text-gray-600">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@posyandu.id"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-lg shadow-teal-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Mengirim...</span>
                </span>
              ) : (
                'Kirim Link Reset Password'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 Posyandu Melati. All rights reserved.
        </p>
      </div>
    </div>
  );
}
