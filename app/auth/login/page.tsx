"use client"

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div
      className="relative flex h-screen w-full overflow-hidden bg-gray-100 bg-cover bg-center"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/dug8yah2g/image/upload/v1762439187/background_cejsj1.jpg')",
      }}
    >
      <div
        role="main"
        aria-label="Đăng nhập vào hệ thống DicomPro"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-8 md:px-12"
      >
        <div className="w-full max-w-lg bg-white/50 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5 sm:p-12 min-h-[65vh] md:min-h-[75vh] flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-3 leading-tight">Chào mừng trở lại!</h2>
            <p className="text-muted-foreground leading-relaxed">Đăng nhập vào hệ thống quản lý hình ảnh DICOM</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
