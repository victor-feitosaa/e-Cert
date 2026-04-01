import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/* ── tipos de modo ── */
type AuthMode = "login" | "register";

export function AuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [mode, setMode] = useState<AuthMode>("login");n
  const [animating, setAnimating] = useState(false);

  /* Troca de modo com micro-animação */
  const switchMode = (next: AuthMode) => {
    if (next === mode || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setMode(next);
      setAnimating(false);
    }, 220);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* ── Pill switcher ── */}
      <div
        className="flex items-center self-center rounded-full p-1 gap-1"
        style={{
          background: "rgba(13,17,32,0.85)",
          border: "1px solid rgba(139,92,246,0.18)",
          backdropFilter: "blur(20px)",
        }}
      >
        {(["login", "register"] as AuthMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={{
              fontFamily: "Nunito, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: mode === m ? "#ffffff" : "#8b85aa",
              background:
                mode === m
                  ? "linear-gradient(135deg, #7c3aed, #9333ea)"
                  : "transparent",
              border: "none",
              padding: "7px 20px",
              borderRadius: 9999,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow:
                mode === m ? "0 2px 12px rgba(124,58,237,0.35)" : "none",
            }}
          >
            {m === "login" ? "Entrar" : "Cadastrar"}
          </button>
        ))}
      </div>

      {/* ── Card ── */}
      <div
        style={{
          transition: "opacity 0.22s ease, transform 0.22s ease",
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(6px)" : "translateY(0)",
        }}
      >
        <Card
          style={{
            background: "#111827",
            border: "1px solid rgba(139,92,246,0.18)",
            borderRadius: 20,
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.45), 0 0 40px rgba(124,58,237,0.05)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* top shimmer line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 1,
              background:
                "linear-gradient(90deg,transparent,rgba(167,139,250,0.5),transparent)",
            }}
          />

          <CardHeader>
            <CardTitle
              style={{
                fontFamily: "Nunito, sans-serif",
                fontSize: 22,
                fontWeight: 900,
                color: "#e8e4ff",
                letterSpacing: -0.4,
              }}
            >
              {mode === "login" ? "Bem-vindo de volta" : "Criar sua conta"}
            </CardTitle>
            <CardDescription style={{ color: "#8b85aa", fontSize: 14 }}>
              {mode === "login"
                ? "Entre com seu e-mail e senha para continuar."
                : "Preencha os dados abaixo para começar gratuitamente."}
            </CardDescription>
          </CardHeader>

          <CardContent>

            <form>
              <FieldGroup>
                {/* Nome — só no cadastro */}
                {mode === "register" && (
                  <Field>
                    <FieldLabel
                      htmlFor="name"
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "#e8e4ff",
                      }}
                    >
                      Nome completo
                    </FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      required
                      style={inputStyle}
                    />
                  </Field>
                )}

                <Field>
                  <FieldLabel
                    htmlFor="email"
                    style={{ fontSize: 13.5, fontWeight: 700, color: "#e8e4ff" }}
                  >
                    E-mail
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@exemplo.com.br"
                    required
                    style={inputStyle}
                  />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel
                      htmlFor="password"
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "#e8e4ff",
                      }}
                    >
                      Senha
                    </FieldLabel>
                    {mode === "login" && (
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        style={{ color: "#a78bfa", fontSize: 13 }}
                      >
                        Esqueceu a senha?
                      </a>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    style={inputStyle}
                  />
                </Field>

                {/* Confirmar senha — só no cadastro */}
                {mode === "register" && (
                  <Field>
                    <FieldLabel
                      htmlFor="confirm-password"
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "#e8e4ff",
                      }}
                    >
                      Confirmar senha
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      style={inputStyle}
                    />
                  </Field>
                )}

                <Field>
                  {/* CTA button */}
                  <a
                    href="/"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#ffffff",
                      background:
                        "linear-gradient(135deg, #7c3aed, #9333ea)",
                      border: "none",
                      padding: "13px",
                      borderRadius: 10,
                      cursor: "pointer",
                      textDecoration: "none",
                      boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "translateY(-2px)";
                      (
                        e.currentTarget as HTMLAnchorElement
                      ).style.boxShadow =
                        "0 8px 30px rgba(124,58,237,0.55)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.transform =
                        "";
                      (
                        e.currentTarget as HTMLAnchorElement
                      ).style.boxShadow =
                        "0 4px 20px rgba(124,58,237,0.4)";
                    }}
                  >
                    {mode === "login" ? "Entrar na plataforma" : "Criar conta grátis"}
                  </a>

                  <FieldDescription
                    style={{
                      textAlign: "center",
                      paddingTop: 16,
                      fontSize: 13,
                      color: "#8b85aa",
                    }}
                  >
                    {mode === "login" ? (
                      <>
                        Não tem conta?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("register")}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "#a78bfa",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: 13,
                            fontFamily: "Nunito, sans-serif",
                          }}
                        >
                          Cadastre-se gratuitamente →
                        </button>
                      </>
                    ) : (
                      <>
                        Já tem conta?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("login")}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "#a78bfa",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: 13,
                            fontFamily: "Nunito, sans-serif",
                          }}
                        >
                          Entrar →
                        </button>
                      </>
                    )}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Estilo base dos inputs ── */
const inputStyle: React.CSSProperties = {
  fontFamily: "Nunito, sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: "#e8e4ff",
  background: "#161f30",
  border: "1.5px solid rgba(139,92,246,0.18)",
  borderRadius: 10,
  padding: "12px 14px",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s, box-shadow 0.2s",
};