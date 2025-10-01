import FetchStatus from '@/components/FetchStatus'
import Header from '../_components/Header'
import OrganizationSidebar from './[id]/_components/Layout/Sidebar'
import { ORGANIZER_ROLE } from '@/lib/Constants.js'
import { Outlet } from 'react-router-dom'
import { getEventId } from '@/lib/utils'
import { useEffect } from 'react'
import { useGetEvent } from '@/hooks/events/useEventState'
import { useNavigator } from '@/lib/navigation'

export default function LayoutOrganization() {
  const { data: eventData, isPending } = useGetEvent()

  const layoutComponent = <Layout eventData={eventData || {}} />
  return (
    <FetchStatus
      isPending={isPending}
      error={false}
      component={layoutComponent}
    />
  )
}

function Layout({ eventData }) {
  const eventTitle = eventData?.title || ''
  const roles = eventData?.roles || []
  const isOrganizer = roles.includes(ORGANIZER_ROLE)

  const eventId = getEventId()
  const navigator = useNavigator()

  useEffect(() => {
    if (
      !roles ||
      roles.length === 0 ||
      roles.filter((role) => role === ORGANIZER_ROLE).length === 0
    ) {
      console.log(roles)
      navigator.to(`/view/events/${eventId}`)
    }
  }, [roles])

  return (
    <div className="flex h-screen bg-white">
      <OrganizationSidebar
        eventTitle={eventTitle}
        eventStatus={eventData?.status}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          eventTitle={eventTitle}
          organizerPage
          isOrganizer={isOrganizer}
        />
        <main className="flex-1 overflow-auto p-6">
          <Outlet context={{ event: eventData }} />
        </main>
      </div>
    </div>
  )
}
