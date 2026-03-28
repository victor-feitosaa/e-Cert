import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// 1️⃣ Importamos o useForm (gerenciador do form) e o zodResolver (ponte Zod ↔ react-hook-form)
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/schemas/auth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  // 2️⃣ Inicializa o form
  // - register: conecta os inputs ao form
  // - handleSubmit: intercepta o submit e só chama onSubmit se o Zod validar
  // - setError: permite colocar erros manualmente (ex: erro que vem da API)
  // - errors: objeto com todos os erros atuais (Zod ou manuais)
  // - isSubmitting: true enquanto o onSubmit está executando (para desabilitar o botão)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema), // Zod cuida da validação
  })

  // 3️⃣ Função chamada SOMENTE se o Zod validar os campos com sucesso
  async function onSubmit(data: LoginInput) {
    try {
      // 4️⃣ Chama o endpoint proxy do Astro (que repassa pra sua API Express)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include", // necessário para receber o cookie jwt da sua API
      })

      const json = await res.json()
      console.log("resposta da API:", json) // remova depois de testar

      // 5️⃣ Se a API retornou erro (401 credenciais erradas, 500 etc.)
      // sua API retorna { error: "..." }, então pegamos json.error
      if (!res.ok) {
        setError("root", { message: json.error ?? "Erro ao fazer login" })
        return
      }

      // 6️⃣ Sucesso — o cookie jwt já foi setado pela sua API automaticamente
      // só precisamos redirecionar
      window.location.href = "/create"

    } catch {
      // 7️⃣ Erro de rede (API offline, sem internet etc.)
      setError("root", { message: "Erro de conexão. Tente novamente." })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 8️⃣ handleSubmit envolve o onSubmit:
              - Lê os valores dos inputs registrados
              - Roda o Zod
              - Só chama onSubmit se tudo for válido */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                {/* 9️⃣ {...register("email")} conecta este input ao react-hook-form
                    É equivalente a: name="email" + ref + onChange + onBlur */}
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {/* Mostra o erro de validação do Zod para este campo */}
                {errors.email && (
                  <FieldDescription className="text-destructive">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  
                    <a href="/teste"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <FieldDescription className="text-destructive">
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>

              {/* 🔟 Erro geral: aparece quando a API retorna 401 ou 500
                  Não é erro de campo específico, é do form inteiro */}
              {errors.root && (
                <FieldDescription className="text-center text-destructive">
                  {errors.root.message}
                </FieldDescription>
              )}

              <Field>
                {/* disabled evita duplo clique enquanto aguarda a API */}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Login"}
                </Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}