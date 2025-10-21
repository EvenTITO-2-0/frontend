import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

export function useToastMutation(mutationFn, options, toastOptions = {}) {
  const { toast } = useToast()
  const { t } = useTranslation('SERVICE')
  const {
    serviceCode,
    successShow = true,
    errorShow = true,
    duration = 2000,
  } = toastOptions

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      if (successShow) {
        toast({
          title: t([`${serviceCode}.SUCCESS.TITLE`, 'SUCCESS.TITLE']),
          description: t([`${serviceCode}.SUCCESS.MESSAGE`, 'SUCCESS.MESSAGE']),
          duration: duration,
        })
      }
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      const errorCode = error?.response?.data?.detail?.errorcode
      if (errorShow) {
        toast({
          variant: 'destructive',
          title: t([
            `${serviceCode}.ERROR.${errorCode}.TITLE`,
            `${serviceCode}.ERROR.TITLE`,
            'ERROR.TITLE',
          ]),
          description: t([
            `${serviceCode}.ERROR.${errorCode}.MESSAGE`,
            `${serviceCode}.ERROR.MESSAGE`,
            'ERROR.MESSAGE',
          ]),
          duration: duration,
        })
      }
      options?.onError?.(error, variables, context)
    },
  })
}
