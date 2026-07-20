import { ResetPasswordForm } from "@/components/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Elegir nueva contraseña</CardTitle>
        <CardDescription>
          Usá al menos 12 caracteres y guardala en tu administrador de contraseñas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
