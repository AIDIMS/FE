"use client"

import React, { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const id = useId()
  const emailId = `${id}-email`
  const passwordId = `${id}-password`

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const validateEmail = (value: string) => {
    if (!value) return "Vui lòng nhập email"
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    return ok ? "" : "Email không hợp lệ"
  }

  const validatePassword = (value: string) => {
    if (!value) return "Vui lòng nhập mật khẩu"
    if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự"
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    setEmailError(eErr)
    setPasswordError(pErr)

    if (eErr || pErr) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 900))
      console.log("Đăng nhập:", { email, password, remember })
    } catch (err) {
      setFormError("Email hoặc mật khẩu không đúng")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor={emailId} className="text-gray-900 font-medium">
          Địa chỉ email
        </Label>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="abc@gmail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError("")
          }}
          onBlur={(e) => setEmailError(validateEmail(e.target.value))}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? `${emailId}-error` : undefined}
          required
          className="bg-white/80 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
        />
        {emailError && (
          <div id={`${emailId}-error`} className="text-sm text-red-700 mt-1" role="alert">
            {emailError}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={passwordId} className="text-gray-900 font-medium">
            Mật khẩu
          </Label>
          <a href="/forgot-password" className="text-sm text-black hover:text-blue-700 transition-colors">
            Quên mật khẩu?
          </a>
        </div>

        <div className="relative">
          <Input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) setPasswordError("")
            }}
            onBlur={(e) => setPasswordError(validatePassword(e.target.value))}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? `${passwordId}-error` : undefined}
            required
            className="bg-white/80 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 pr-12"
          />

          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-2 p-2 rounded-md text-gray-400 hover:text-gray-600 flex items-center justify-center"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>

        {passwordError && (
          <div id={`${passwordId}-error`} className="text-sm text-red-700 mt-1" role="alert">
            {passwordError}
          </div>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-3">
        <input
          id={`${id}-remember`}
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
        />
        <Label htmlFor={`${id}-remember`} className="text-sm text-gray-900">
          Ghi nhớ đăng nhập
        </Label>
      </div>

      {/* Form-level error */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert" aria-live="assertive">
          {formError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full bg-black hover:bg-blue-900 text-white font-semibold py-2 h-auto rounded-full transition-colors duration-150 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2" role="status" aria-live="polite">
            <svg
              className="w-4 h-4 animate-spin"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Đang đăng nhập...
          </span>
        ) : (
          "Đăng nhập"
        )}
      </Button>

      <div className="pt-4">
        <p className="text-xs text-gray-500 text-center">
          Khi đăng nhập, bạn đồng ý với {" "}
          <a href="/terms" className="text-black hover:text-blue-700 hover:underline font-semibold">
            Điều khoản dịch vụ
          </a>{" "}
          và {" "}
          <a href="/privacy" className="text-black hover:text-blue-700 hover:underline font-semibold">
            Chính sách bảo mật
          </a>{" "}
          của chúng tôi.
        </p>
      </div>
    </form>
  )
}
