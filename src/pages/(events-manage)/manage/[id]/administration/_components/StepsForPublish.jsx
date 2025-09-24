import { STARTED_STATUS } from '@/lib/Constants'
import SubtitleStyle from './SubtitleStyle'
import CardWithFocus from '@/components/Card/CardWithFocus'
import { useNavigator } from '@/lib/navigation'
import Icon from '@/components/Icon'
import {
  endDateIsDefined,
  metadataIsDefined,
  pricesAreDefined,
  startDateIsDefined,
  submissionLimitIsDefined,
  tracksAreDefined,
  mercadoPagoIsConnected,
} from './utils'
import PublishEventButton from './PublishEventButton'
import { useEvent } from '@/lib/layout'
import { useGetProviderStatus } from '@/hooks/events/useProviderHooks'
import { useState } from 'react'
import { eventsClient } from '@/services/api/clients'

export default function StepsForPublish({ eventInfo }) {
  if (eventInfo.status === STARTED_STATUS) return null

  const eventData = useEvent()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { data: providerStatus, isLoading: isLoadingStatus } =
    useGetProviderStatus(eventData.id)

  const navigator = useNavigator()
  function navigate(to) {
    navigator.replaceOrAppend(['administration', 'general', 'view'], to)
  }

  const connectWithMercadoPago = async () => {
    try {
      setIsRedirecting(true)
      const { data: url } = await eventsClient.get(
        `/${eventData.id}/provider/oauth/url`
      )
      window.location.href = url
    } catch (e) {
      console.error('No se pudo obtener URL de OAuth', e)
      setIsRedirecting(false)
    }
  }

  const statusList = [
    startDateIsDefined(eventInfo) && endDateIsDefined(eventInfo),
    submissionLimitIsDefined(eventInfo),
    metadataIsDefined(eventInfo),
    tracksAreDefined(eventInfo),
    pricesAreDefined(eventInfo),
    mercadoPagoIsConnected(eventInfo),
  ]
  const amountOK = statusList.filter((s) => s).length

  return (
    <div className="space-y-6">
      <SubtitleStyle>
        ({amountOK}/{statusList.length}) Pasos para publicar el evento{' '}
      </SubtitleStyle>
      <div className="space-y-4">
        <StatusCheck
          title="Definir fecha de comienzo y de fin del evento"
          navigateTo={() => navigate('activities')}
          status={statusList[0]}
        />
        <StatusCheck
          title="Definir fecha límite de recepción de trabajos"
          navigateTo={() => navigate('tracks')}
          status={statusList[1]}
        />
        <StatusCheck
          title="Completar campos: 'ubicación', 'contacto' y 'organizado por'"
          navigateTo={() => navigate('info')}
          status={statusList[2]}
        />
        <StatusCheck
          title="Configurar al menos un track"
          navigateTo={() => navigate('tracks')}
          status={statusList[3]}
        />
        <StatusCheck
          title="Configurar al menos una tarifa"
          navigateTo={() => navigate('pricing')}
          status={statusList[4]}
        />
        <MercadoPagoStatusCheck
          title="Conectar cuenta de Mercado Pago"
          status={statusList[5]}
          onConnect={connectWithMercadoPago}
          isRedirecting={isRedirecting}
          providerStatus={providerStatus}
        />
      </div>
      <PublishEventButton conditionsMet={amountOK === statusList.length} />
    </div>
  )
}

function StatusCheck({ title, navigateTo, status }) {
  const rightComponent = status ? (
    <Icon name="CircleCheck" classNames={'text-green-500'} />
  ) : (
    <Icon name="CircleX" classNames={'text-red-500'} />
  )

  return (
    <CardWithFocus onClick={navigateTo} icon={rightComponent}>
      <div className="flex-grow">{title}</div>
    </CardWithFocus>
  )
}

function MercadoPagoStatusCheck({
  title,
  status,
  onConnect,
  isRedirecting,
  providerStatus,
}) {
  const rightComponent = status ? (
    <Icon name="CircleCheck" classNames={'text-green-500'} />
  ) : (
    <Icon name="CircleX" classNames={'text-red-500'} />
  )

  const handleClick = () => {
    if (!status) {
      onConnect()
    }
  }

  return (
    <CardWithFocus onClick={handleClick} icon={rightComponent}>
      <div className="flex-grow">
        {title}
        {status && providerStatus && (
          <div className="text-sm text-green-600 mt-1">
            Cuenta vinculada y{' '}
            {providerStatus.account_status === 'ACTIVE'
              ? 'activa'
              : 'pendiente de aprobación'}
          </div>
        )}
        {!status && (
          <div className="text-sm text-red-600 mt-1">
            {/*isRedirecting ? 'Conectando...' : 'Haz clic para conectar'*/}
          </div>
        )}
      </div>
    </CardWithFocus>
  )
}
