'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Đăng nhập thành công!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Có lỗi xảy ra khi đăng nhập');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="md:hidden text-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary mb-2">Kinderly</h1>
      </div>
      <h2 className="font-heading text-3xl font-bold text-on-surface mb-2">Chào mừng bạn trở lại!</h2>
      <p className="font-sans text-base text-on-surface-variant mb-6">Vui lòng nhập thông tin để đăng nhập.</p>
      
      <form onSubmit={handleLogin} className="space-y-4 flex-grow">
        <div>
          <label htmlFor="email" className="block font-sans text-sm font-bold text-on-surface mb-1.5">Địa chỉ Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="teacher@school.edu" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-surface-container-high bg-surface-bright focus:border-primary focus:ring-0 transition-colors font-sans text-base outline-none" 
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block font-sans text-sm font-bold text-on-surface mb-1.5">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-surface-container-high bg-surface-bright focus:border-primary focus:ring-0 transition-colors font-sans text-base outline-none" 
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input 
              id="remember-me" 
              name="remember-me" 
              type="checkbox" 
              className="h-4 w-4 text-primary focus:ring-primary border-surface-container-high rounded cursor-pointer" 
            />
            <label htmlFor="remember-me" className="ml-2 block font-sans text-base text-on-surface-variant cursor-pointer">
              Ghi nhớ tôi
            </label>
          </div>
          <div className="text-sm">
            <Link href="/forgot-password" className="font-sans font-bold text-sm text-primary hover:text-primary-container transition-colors">
              Quên mật khẩu?
            </Link>
          </div>
        </div>
        
        <div className="pt-1">
          <Button type="submit" variant="default" className="w-full py-6 text-base rounded-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Đăng nhập
          </Button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <p className="font-sans text-base text-on-surface-variant">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-sans font-bold text-sm text-primary hover:text-primary-container transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>
      
      <footer className="mt-auto pt-12 flex flex-col md:flex-row justify-between items-center text-on-surface-variant font-sans text-sm">
        <p>© 2024 Kinderly.</p>
        <div className="space-x-4 mt-2 md:mt-0">
          <Link href="#" className="hover:text-primary transition-colors">Trợ giúp</Link>
          <Link href="#" className="hover:text-primary transition-colors">Quyền riêng tư</Link>
        </div>
      </footer>
    </>
  );
}
