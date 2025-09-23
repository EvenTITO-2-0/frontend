import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSelector } from 'react-redux'
import {
  useSignUpWithEmailAndPassword,
  useSignUpWithGoogle,
} from '@/hooks/auth/authHooks'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import ContainerAuthPage from '../_components/ContainerAuthPage'
import GoogleButton from '../_components/GoogleButton'
import { isAuthenticated } from '@/lib/routes/isAuthenticated.js'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [redirectToCompleteRegister, setRedirectToCompleteRegister] =
    useState(false)
  const { currentUser } = useSelector((state) => state.user)
  const { idUser, email: authEmail } = useSelector((state) => state.auth)
  const validationPasswordRegex =
    /^(?=.*[0-9])(?=.*[!@#$&])[a-zA-Z0-9!@#$&]{6,15}$/

  const signupMutation = useSignUpWithEmailAndPassword()
  const googleSignupMutation = useSignUpWithGoogle()

  const onSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    if (password !== repeatPassword) {
      setError(true)
      setErrorMessage('Las contraseñas no coinciden')
      return
    }
    if (!validationPasswordRegex.test(password)) {
      setError(true)
      setErrorMessage(
        'Contraseña inválida. Debe contener entre 6 y 15 caracteres con al menos un número y un carácter especial (Ejemplo: !,@,#,$ o &).'
      )
      return
    }
    try {
      await signupMutation.mutateAsync({ email, password })
      setRedirectToCompleteRegister(true)
    } catch (error) {
      setError(true)
      const errorCode = error.code
      switch (errorCode) {
        case 'auth/weak-password':
          setErrorMessage('Contraseña insegura.')
          break
        case 'auth/email-already-in-use':
          setErrorMessage('Ya existe una cuenta vinculada al email ingresado.')
          break
        default:
          console.error(errorCode)
          setErrorMessage(
            'No pudo crearse la cuenta. Por favor intente más tarde'
          )
          break
      }
    }
  }

  const onGoogleSignup = async () => {
    try {
      await googleSignupMutation.mutateAsync()
      setRedirectToCompleteRegister(true)
    } catch (error) {
      setError(true)
      setErrorMessage('Error al registrarse con Google')
    }
  }

  console.log('Constantes de validación signup:', {
    currentUser,
    idUser,
    authEmail,
  })

  if (isAuthenticated()) {
    return <Navigate to={'/home'} />
  }

  if (redirectToCompleteRegister) {
    return <Navigate to="/complete-register" replace />
  }

  return (
    <ContainerAuthPage title="Crear cuenta" isLogin={false}>
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
        <div>
          <label
            htmlFor="repeatPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Repetir Contraseña
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="repeatPassword"
              type="password"
              placeholder="Repetí tu contraseña"
              className="pl-10"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{errorMessage}</p>}
        <ButtonWithLoading
          type="submit"
          className="w-full"
          isLoading={signupMutation.isPending}
        >
          Crear cuenta
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
      <GoogleButton text="Registrarse con Google" onClick={onGoogleSignup} />
    </ContainerAuthPage>
  )
}
