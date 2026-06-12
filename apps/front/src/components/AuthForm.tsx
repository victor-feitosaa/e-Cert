// src/components/AuthForm.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema } from "../../../shared/src/schemas/auth/auth";
import { AlertCircle, Mail, Lock, User, CreditCard } from "lucide-react";

type AuthMode = "login" | "register";

function getInitialMode() {
  if (typeof window === "undefined") return "login";
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "register" ? "register" : "login";
}

function getRedirectUrl() {
  if (typeof window === "undefined") return "/userDashboard";
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "/userDashboard";
}

export default function AuthForm() {
  const [mode, setMode] = useState(getInitialMode());
  const [animating, setAnimating] = useState(false);

  const switchMode = (next) => {
    if (next === mode || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setMode(next);
      reset();
      setAnimating(false);
    }, 220);
  };

  const isLogin = mode === "login";

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const url = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email: data.email, password: data.password }
        : data;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        setError("root", { message: json.error ?? "Erro ao autenticar" });
        return;
      }

      window.location.href = getRedirectUrl();
    } catch (error) {
      setError("root", { message: "Erro de conexão. Tente novamente." });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto transition-all duration-200">
      {/* Switcher */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-1 p-1 rounded-full bg-[#13111e]/80 backdrop-blur-sm border border-white/[0.07]">
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-6 py-2 text-sm font-bold rounded-full transition-all cursor-pointer ${
                mode === m
                  ? "bg-gradient-to-r from-[#8b5cf6] to-[#9333ea] text-white shadow-md"
                  : "text-[#6b6888] hover:text-white"
              }`}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        className={`bg-[#11101B] border border-border rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-200 ${
          animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        <h2 className="text-xl font-black text-accent-foreground tracking-tight mb-1">
          {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
        </h2>
        <p className="text-sm text-accent-foreground/60 mb-6">
          {isLogin
            ? "Entre com seu e-mail e senha para continuar."
            : "Preencha os dados abaixo para começar gratuitamente."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome (apenas cadastro) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                Nome completo <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6888]" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  className="w-full text-accent-foreground pl-10 pr-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
              )}
            </div>
          )}

          {/* E-mail */}
          <div>
            <label className="block text-sm font-bold text-accent-foreground mb-1.5">
              E-mail <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6888]" />
              <input
                type="email"
                placeholder="voce@exemplo.com"
                className="w-full  text-accent-foreground pl-10 pr-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* CPF (apenas cadastro) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                CPF <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6888]" />
                <input
                  type="text"
                  placeholder="00000000000"
                  maxLength={11}
                  className="w-full  text-accent-foreground pl-10 pr-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                  {...register("cpf")}
                />
              </div>
              {errors.cpf && (
                <p className="text-xs text-red-400 mt-1">{errors.cpf.message}</p>
              )}
            </div>
          )}

          {/* Senha */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-accent-foreground">
                Senha <span className="text-primary">*</span>
              </label>
              {isLogin && (
                <a href="#" className="text-xs text-primary hover:underline">
                  Esqueceu a senha?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6888]" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full  text-accent-foreground pl-10 pr-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar senha (apenas cadastro) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-accent-foreground mb-1.5">
                Confirmar senha <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6888]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full  text-accent-foreground pl-10 pr-4 py-2.5 rounded-lg text-sm bg-[#11101B] border border-border focus:border-primary outline-none placeholder:text-accent-foreground/40"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          {/* Erro geral */}
          {errors.root && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={16} />
              {errors.root.message}
            </div>
          )}

          {/* Botão submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#8b5cf6] to-[#9333ea] shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : isLogin ? (
              "Entrar na plataforma"
            ) : (
              "Criar conta grátis"
            )}
          </button>

          {/* Link de alternância */}
          <p className="text-center text-sm text-accent-foreground/60">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? "register" : "login")}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              {isLogin ? "Cadastre-se gratuitamente →" : "Entrar →"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}