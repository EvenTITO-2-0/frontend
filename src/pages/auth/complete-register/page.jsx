import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSelector } from 'react-redux'
import { useCompleteRegister } from '@/hooks/auth/authHooks'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import ContainerAuthPage from '../_components/ContainerAuthPage'
import { isAuthenticated } from '@/lib/routes/isAuthenticated.js'

export default function CompleteRegisterPage() {
  const [name, setName] = useState('')
  const [lastname, setLastname] = useState('')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { currentUser } = useSelector((state) => state.user)
  const { idUser, email } = useSelector((state) => state.auth)

  const completeRegisterMutation = useCompleteRegister()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!name || !lastname) {
      setError(true)
      setErrorMessage('Por favor, completa todos los campos')
      return
    }
    try {
      await completeRegisterMutation.mutateAsync({
        uid: idUser,
        name,
        lastname,
        email,
      })
    } catch (error) {
      console.log(error)
      setError(true)
      setErrorMessage('Error al completar el registro')
    }
  }

  if (isAuthenticated()) {
    return <Navigate to={'/home'} />
  }

  if (!idUser || !email) {
    return <Navigate to="/login" replace />
  }

  return (
    <ContainerAuthPage title="Completar registro">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre
          </label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Ingresá tu nombre"
              className="pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="lastname"
            className="block text-sm font-medium text-gray-700"
          >
            Apellido
          </label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="lastname"
              type="text"
              placeholder="Ingresá tu apellido"
              className="pl-10"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{errorMessage}</p>}
        <ButtonWithLoading
          type="submit"
          className="w-full"
          isLoading={completeRegisterMutation.isPending}
        >
          Completar registro
        </ButtonWithLoading>
      </form>
    </ContainerAuthPage>
  )
}
