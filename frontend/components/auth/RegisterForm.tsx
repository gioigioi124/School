'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, User, Mail, School, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RegisterForm() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: fullname,
            school: school,
          }
        }
      });

      if (error) throw error;

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        router.push('/login');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Có lỗi xảy ra khi đăng ký');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-heading text-3xl font-bold text-on-surface mb-2">
          Đăng ký tài khoản
        </h1>
        <p className="font-sans text-base text-on-surface-variant">
          Tham gia Kinderly để bắt đầu hành trình tuyệt vời cùng các bé.
        </p>
      </div>
      
      <form onSubmit={handleRegister} className="space-y-4 flex-grow">
        {/* Name Field */}
        <div>
          <label className="block font-sans text-sm font-bold text-on-surface mb-1.5" htmlFor="fullname">Họ và tên</label>
          <div className="relative group focus-within:border-primary border border-outline-variant/60 rounded-lg overflow-hidden transition-all bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
            </div>
            <input
              className="block w-full pl-10 pr-4 py-2.5 border-transparent focus:border-transparent focus:ring-0 bg-transparent font-sans text-sm text-on-surface outline-none"
              id="fullname"
              placeholder="Nhập họ và tên của bạn"
              type="text"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block font-sans text-sm font-bold text-on-surface mb-1.5" htmlFor="email">Email</label>
          <div className="relative group focus-within:border-primary border border-outline-variant/60 rounded-lg overflow-hidden transition-all bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
            </div>
            <input
              className="block w-full pl-10 pr-4 py-2.5 border-transparent focus:border-transparent focus:ring-0 bg-transparent font-sans text-sm text-on-surface outline-none"
              id="email"
              placeholder="Nhập email của bạn"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* School Field */}
        <div>
          <label className="block font-sans text-sm font-bold text-on-surface mb-1.5" htmlFor="school">Tên trường</label>
          <div className="relative group focus-within:border-primary border border-outline-variant/60 rounded-lg overflow-hidden transition-all bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <School className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
            </div>
            <input
              className="block w-full pl-10 pr-4 py-2.5 border-transparent focus:border-transparent focus:ring-0 bg-transparent font-sans text-sm text-on-surface outline-none"
              id="school"
              placeholder="Nhập tên trường tiểu học"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block font-sans text-sm font-bold text-on-surface mb-1.5" htmlFor="password">Mật khẩu</label>
          <div className="relative group focus-within:border-primary border border-outline-variant/60 rounded-lg overflow-hidden transition-all bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
            </div>
            <input
              className="block w-full pl-10 pr-4 py-2.5 border-transparent focus:border-transparent focus:ring-0 bg-transparent font-sans text-sm text-on-surface outline-none"
              id="password"
              placeholder="Tạo mật khẩu an toàn"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button type="submit" variant="default" className="w-full py-2.5 text-sm rounded-lg font-bold shadow-xs hover:bg-primary/90 transition-all" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Đăng ký
          </Button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <p className="font-sans text-base text-on-surface-variant">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-sans font-bold text-sm text-primary hover:text-primary-dark transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </>
  );
}
