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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login na sua conta</CardTitle>
          <CardDescription>
            Digite seu email abaixo para logar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup >
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>

            <a
                href="/"
                className="bg-red-500 font-bold text-white bg-linear-to-br from-[#8b5cf6] to-[#9333ea]
                        border-none px-6 py-3 rounded-lg
                        inline-flex items-center justify-center gap-2
                        shadow-[0_4px_8px_rgba(124,58,237,0.4)]
                        transition-transform duration-200
                        hover:-translate-y-0.5 hover:shadow-[0_1px_20px_rgba(124,58,237,0.55)]
                        cursor-pointer no-underline"
            >
                Login
            </a>
                <FieldDescription className="text-center py-5">
                  Não possui uma conta? <a href="#">Cadastre-se</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
