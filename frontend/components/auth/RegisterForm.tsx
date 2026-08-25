'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: email.split('@')[0] // Temporary display name
          }
        }
      });

      if (error) throw error;

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email.');
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
    <Card className="w-full shadow-custom-lg bg-[var(--gradient-card)] border-none">
      <CardHeader className="space-y-1 text-center flex flex-col items-center">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Tạo tài khoản</CardTitle>
        <CardDescription>
          Gia nhập hệ thống học tập ngay hôm nay
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Địa chỉ Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="ten@truong.edu.vn" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input 
              id="password" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>
          <Button type="submit" variant="gradient" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Đăng ký
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 text-center">
        <div className="text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
            Đăng nhập ngay
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
