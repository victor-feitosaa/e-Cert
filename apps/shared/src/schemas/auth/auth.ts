import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;