import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { getEventId } from '@/lib/utils'

export default function PaymentFailurePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const eventId = getEventId()

  useEffect(() => {
    toast({
      title: 'Pago fallido',
      description:
        'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.',
      variant: 'destructive',
    })
  }, [toast])

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-red-600">
            <XCircle className="h-8 w-8 mr-2" />
            Pago Fallido
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Hubo un problema al procesar tu pago. Por favor, verifica los datos
            e intenta nuevamente.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/events/${eventId}/roles/attendee`)}
            >
              Volver al perfil
            </Button>
            <Button
              onClick={() =>
                navigate(`/events/${eventId}/roles/attendee/new-payment`)
              }
            >
              Intentar nuevamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
