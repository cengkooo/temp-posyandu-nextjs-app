'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import AuthLayout from '@/components/admin/layouts/AuthLayout';
import Input from '@/components/admin/forms/Input';
import PasswordInput from '@/components/admin/forms/PasswordInput';
import Checkbox from '@/components/admin/forms/Checkbox';
import Button from '@/components/admin/forms/Button';
import ErrorMessage from '@/components/admin/ui/ErrorMessage';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Email atau password salah. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Redirect to admin dashboard
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Login Admin"
      subtitle="Masuk ke dashboard Posyandu Melati"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Message */}
        <ErrorMessage message={error} onDismiss={() => setError('')} />

        {/* Email Field */}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@posyandu.id"
          required
        />

        {/* Password Field */}
        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox
            label="Ingat Saya"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Link
            href="/forgot-password"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Lupa Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          Masuk
        </Button>
      </form>
    </AuthLayout>
  );
}
