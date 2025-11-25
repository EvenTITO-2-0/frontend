import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDispatch, useSelector } from 'react-redux'
import {
  useLoginWithEmailAndPassword,
  useLoginWithGoogle,
} from '@/hooks/auth/authHooks'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import ContainerAuthPage from '../_components/ContainerAuthPage'
import GoogleButton from '../_components/GoogleButton'
import { isAuthenticated } from '@/lib/routes/isAuthenticated.js'
import { clearAuth } from '@/state/auth/authSlice.js'

export default function LoginPage() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(clearAuth());
  }, [dispatch]);

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { currentUser } = useSelector((state) => state.user)
  const { idUser, email: authEmail } = useSelector((state) => state.auth)

  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loginMutation = useLoginWithEmailAndPassword()
  const googleLoginMutation = useLoginWithGoogle()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await loginMutation.mutateAsync({ email, password })
    } catch (error) {
      setError(true)
      setErrorMessage('Usuario y/o contraseña inválidos')
    }
  }

  const onGoogleLogin = async () => {
    try {
      await googleLoginMutation.mutateAsync()
      console.log('Login exitoso con Google')
    } catch (error) {
      setError(true)
      setErrorMessage('Error al iniciar sesión con Google')
    }
  }

  if (isAuthenticated()) {
    return <Navigate to={'/home'} />
  }
  if (idUser && authEmail && (!currentUser || !isAuthenticated())) {
    return <Navigate to="/complete-register" replace />
  }

  return (
    <ContainerAuthPage title="Iniciar sesión">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Ingresá tu email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Ingresá tu contraseña"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{errorMessage}</p>}
        <ButtonWithLoading
          type="submit"
          className="w-full"
          isLoading={loginMutation.isPending}
        >
          Continuar
        </ButtonWithLoading>
      </form>
      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">O</span>
        </div>
      </div>
      <GoogleButton text="Continuar con Google" onClick={onGoogleLogin} />
    </ContainerAuthPage>
  )
}
