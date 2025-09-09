import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { getEventId } from '@/lib/utils'

export default function PaymentPendingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const eventId = getEventId()

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['getMyInscription', { eventId }],
    })

    toast({
      title: 'Pago pendiente',
      description:
        'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
    })
  }, [eventId, queryClient, toast])

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-yellow-600">
            <Clock className="h-8 w-8 mr-2" />
            Pago Pendiente
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Tu pago está siendo procesado. Esto puede tomar unos minutos. Te
            notificaremos cuando el pago se complete.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(`/events/${eventId}/roles/attendee`)}
          >
            Volver al perfil
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
