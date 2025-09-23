import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import {
  completeRegister,
  getUser,
  login,
  loginWithGoogle,
  logOut,
  signUp,
  signUpWithGoogle,
} from '@/services/api/auth/queries'
import { clearAuth, register } from '@/state/auth/authSlice'
import { loginCompleted, logout } from '@/state/user/userSlice'

export function useLoginWithEmailAndPassword() {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const user = await login({ email, password })
      try {
        const userLoggedin = await getUser(user.uid)
        return { user: userLoggedin, isLogged: true }
      } catch (error) {
        return { user, isLogged: false }
      }
    },
    onSuccess: (data) => {
      if (data.isLogged) {
        dispatch(clearAuth())
        dispatch(loginCompleted(data.user))
      } else {
        dispatch(register({ idUser: data.user.uid, email: data.user.email }))
      }
    },
  })
}

export function useLoginWithGoogle() {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: async () => {
      const user = await loginWithGoogle()
      try {
        const userLoggedin = await getUser(user.uid)
        return { user: userLoggedin, isLogged: true }
      } catch (error) {
        console.log("Error al obtener el usuario después del inicio de sesión con Google:", error)
        return { user, isLogged: false }
      }
    },
    onSuccess: (data) => {
      if (data.isLogged) {
        dispatch(clearAuth())
        dispatch(loginCompleted(data.user))
      } else {
        dispatch(register({ idUser: data.user.uid, email: data.user.email }))
      }
    },
  })
}

export function useSignUpWithEmailAndPassword() {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: async ({ email, password }) => {
      return await signUp({ email, password })
    },
    onSuccess: (data) => {
      dispatch(register({ idUser: data.uid, email: data.email }))
    },
  })
}

export function useSignUpWithGoogle() {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: async () => {
      return await signUpWithGoogle()
    },
    onSuccess: (data) => {
      dispatch(register({ idUser: data.uid, email: data.email }))
    },
  })
}

export function useCompleteRegister() {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: async ({ uid, name, lastname, email }) => {
      await completeRegister({ uid, name, lastname, email })
      return await getUser(uid)
    },
    onSuccess: (data) => {
      dispatch(clearAuth())
      dispatch(loginCompleted(data))
    },
  })
}

export function useLogout() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await logOut()
    },
    onSuccess: () => {
      dispatch(clearAuth())
      dispatch(logout())
      queryClient.clear()
    },
  })
}
