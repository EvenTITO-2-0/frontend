import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { getEventId } from '@/lib/utils'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const eventId = getEventId()

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['getMyInscription', { eventId }],
    })

    toast({
      title: '¡Pago exitoso!',
      description: 'Tu pago ha sido procesado correctamente.',
    })

    const timeout = setTimeout(() => {
      navigate(`/events/${eventId}/roles/attendee`)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [eventId, navigate, queryClient, toast])

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-8 w-8 mr-2" />
            Pago Exitoso
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Tu pago ha sido procesado correctamente. Serás redirigido a tu
            perfil en unos segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
