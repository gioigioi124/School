import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] flex flex-col md:flex-row w-full max-w-[1000px] min-h-[600px] overflow-hidden animate-scale-in">
        
        {/* Illustration Side */}
        <div className="hidden md:flex flex-col bg-tertiary-container w-1/2 p-12 justify-between relative">
          <div className="z-10">
            <h1 className="font-heading text-5xl font-bold text-on-tertiary-container mb-4">Kinderly</h1>
            <p className="font-heading text-2xl font-semibold text-on-tertiary-container max-w-sm">Nuôi dưỡng lớp học, đơn giản hóa quản lý.</p>
          </div>
          <div className="flex-grow flex items-center justify-center mt-8 z-10">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM6FEtZE44Z1qqbA6enXMGmg43l0wbx08ifkzJmd2jnaA0wUFCstBO3y3x2kDDKj3pjh2MfWzqPsLd2qv8vwexYpd7rC4wlpYx-F7boYkwvRD8RwXCYQgMq4CTLcMeEqERBHQMgmukl6nHYH70vgP3YSk1qeof35dshbWCJpBXfj3Uhr4KJQWMeiIiLuKz72aPnjdw-FCS72RhGFE-UxaPeyjmhtza5a-ZT6g62kUktB2os7OMe2graw" 
              alt="Kinderly Illustration" 
              className="w-full max-w-md object-contain drop-shadow-xl" 
            />
          </div>
          {/* Abstract decorative elements */}
          <div className="absolute top-10 right-10 w-24 h-24 bg-primary-container rounded-full opacity-50 blur-xl"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-secondary-container rounded-full opacity-50 blur-xl"></div>
        </div>

        {/* Login Form Side */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest relative">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
