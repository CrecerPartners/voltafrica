import { AuthProvider } from "@digihire/shared";

export default function Login() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Brands dashboard — coming soon</p>
      </div>
    </AuthProvider>
  );
}
