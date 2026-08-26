'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, UserCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Allow login via email (teachers/admins) or phone number (parents/students)
      const cleanInput = identifier.trim();
      const isEmail = cleanInput.includes('@');
      const normalizedEmail = isEmail 
        ? cleanInput.toLowerCase() 
        : `${cleanInput.replace(/\D/g, '')}@kinderly.com`;

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) throw error;

      toast.success('Đăng nhập thành công!');
      
      if (!isEmail || normalizedEmail.endsWith('@kinderly.com')) {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        let message = error.message;
        if (message.includes('Email not confirmed')) {
          message = 'Tài khoản chưa xác nhận email. Vui lòng kiểm tra hộp thư của bạn.';
        } else if (message.includes('Invalid login credentials')) {
          message = 'Email / Số điện thoại hoặc mật khẩu không chính xác.';
        }
        toast.error(message);
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
      <p className="font-sans text-base text-on-surface-variant mb-6">Nhập Email (Giáo viên) hoặc Số điện thoại (Phụ huynh) để đăng nhập.</p>
      
      <form onSubmit={handleLogin} className="space-y-4 flex-grow">
        <div>
          <label htmlFor="identifier" className="block font-sans text-sm font-bold text-on-surface mb-1.5">
            Email hoặc Số điện thoại
          </label>
          <div className="relative">
            <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input 
              id="identifier" 
              name="identifier" 
              type="text" 
              placeholder="teacher@school.edu hoặc 0912345678" 
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
              placeholder="•••••••• (Mặc định: 123456)" 
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
          <Button type="submit" variant="default" className="w-full py-6 text-base rounded-full btn-3d font-bold" disabled={isLoading}>
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
        <p>© 2026 Kinderly.</p>
        <div className="space-x-4 mt-2 md:mt-0">
          <Link href="#" className="hover:text-primary transition-colors">Trợ giúp</Link>
          <Link href="#" className="hover:text-primary transition-colors">Quyền riêng tư</Link>
        </div>
      </footer>
    </>
  );
}
