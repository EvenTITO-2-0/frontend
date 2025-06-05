import { ORGANIZER_ROLE } from '@/lib/Constants'
import SideBar from '@/pages/(events-manage)/_components/Sidebar'
import SidebarIcon from '@/components/SidebarIcon'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function OrganizationSidebar({ eventTitle }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`bg-gray-100 transition-all duration-300 ease-in-out flex flex-col h-screen ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      <div
        className={`p-4 flex items-center justify-between ${isCollapsed ? 'pl-3' : ''}`}
      >
        <h1 className={`font-semibold truncate ${isCollapsed ? 'hidden' : ''}`}>
          {eventTitle}
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <SidebarIcon
            name="PanelLeftClose"
            className={isCollapsed ? 'rotate-180' : ''}
          />
        </Button>
      </div>
      <SideBar
        itemList={itemList}
        isSidebarOpen={!isCollapsed}
        roles={[ORGANIZER_ROLE]}
      />
    </aside>
  )
}

const itemList = [
  {
    label: 'Configuración',
    children: [
      {
        label: 'Administración',
        icon: <SidebarIcon name="Settings" />,
        to: 'administration',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
      {
        label: 'Información general',
        icon: <SidebarIcon name="Info" />,
        to: 'info',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
      {
        label: 'Pagos',
        icon: <SidebarIcon name="CreditCard" />,
        to: 'payments',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
      {
        label: 'Actividades',
        icon: <SidebarIcon name="Calendar" />,
        to: 'activities',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
      {
        label: 'Comité de miembros',
        icon: <SidebarIcon name="Users" />,
        to: 'members',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
      {
        label: 'Tracks y revisiones',
        icon: <SidebarIcon name="BookOpenCheck" />,
        to: 'tracks',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
      {
        label: 'Tarifas',
        icon: <SidebarIcon name="DollarSign" />,
        to: 'pricing',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
      {
        label: 'Salas',
        icon: <SidebarIcon name="MapPin" />,
        to: 'rooms',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
    ],
  },
  {
    label: 'Datos del evento',
    children: [
      {
        label: 'Inscripciones',
        icon: <SidebarIcon name="BookOpenCheck" />,
        to: 'inscriptions',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
      {
        label: 'Presentaciones',
        icon: <SidebarIcon name="CalendarCheck" />,
        to: 'talks',
        requiredRoles: [ORGANIZER_ROLE],
        isOrganizerRoute: true,
      },
    ],
  },
]
