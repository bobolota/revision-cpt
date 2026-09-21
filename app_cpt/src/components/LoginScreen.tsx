import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginScreenProps {
  email: string
  setEmail: (val: string) => void
  password: string
  setPassword: (val: string) => void
  authLoading: boolean
  authError: string
  handleLogin: (e: React.FormEvent) => void
}

export function LoginScreen({
  email, setEmail, password, setPassword, authLoading, authError, handleLogin
}: LoginScreenProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Connexion</CardTitle>
          <CardDescription className="text-center">Portail de révision</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            <Button type="submit" className="w-full mt-2" disabled={authLoading}>
              {authLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}