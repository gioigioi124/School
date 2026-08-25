import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-[1000px] bg-surface-container-lowest rounded-xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row animate-scale-in">
        {/* Left Column: Illustration (Desktop Only) */}
        <div className="hidden md:flex md:w-1/2 bg-surface-container p-12 flex-col justify-center items-center relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <img
            className="relative z-10 w-full max-w-sm rounded-lg object-contain"
            alt="Kinderly Teacher and Children"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3WYYbQ1rq6ZQUaTwYkFT8Hx1aaTF7446HrPeEE7cEcIb0s6we3znrMd3IlCZD4VQJE6tKKE0JgNDdTXtxoQYQFwjeqb-6ggXlZi-kAAcpVv_peO-6y5d3lhXoFUIqprlp9uKp7gOD1FUtRCOwMdKlBzV7Xwl9jkWHOoDHkdTbKpaK4ssYXeTGPsjJKyn_PaTtHoZQmQJdjAHoBYCFgcX8UtHf7dIkVnsE4hmTDcg1DpEwJLZEgI8wMQ"
          />
          <div className="relative z-10 text-center mt-8 space-y-4">
            <h2 className="font-heading text-4xl font-bold text-primary">
              Kinderly
            </h2>
            <p className="font-sans text-base text-on-surface-variant">
              Giúp việc quản lý lớp học trở nên nhẹ nhàng và tràn ngập niềm vui.
            </p>
          </div>
        </div>
        
        {/* Right Column: Registration Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-surface-container-lowest">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
