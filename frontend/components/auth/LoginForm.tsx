'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="w-full shadow-custom-lg bg-[var(--gradient-card)] border-none">
      <CardHeader className="space-y-1 text-center flex flex-col items-center">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Đăng nhập</CardTitle>
        <CardDescription>
          Nhập email và mật khẩu để truy cập hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                Quên mật khẩu?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>
          <Button type="submit" variant="gradient" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Đăng nhập
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 text-center">
        <div className="text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
            Đăng ký ngay
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
