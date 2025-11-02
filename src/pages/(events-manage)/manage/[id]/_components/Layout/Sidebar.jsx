import { ORGANIZER_ROLE, STARTED_STATUS } from '@/lib/Constants'
import SideBar from '@/pages/(events-manage)/_components/Sidebar'
import SidebarIcon from '@/components/SidebarIcon'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function OrganizationSidebar({ eventTitle, eventStatus }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Filter only if event is published
  const filteredItemList =
    eventStatus === STARTED_STATUS
      ? itemList.map((section) => ({
          ...section,
          children: section.children.filter(
            (item) => item.to !== 'administration'
          ),
        }))
      : itemList

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
        itemList={filteredItemList}
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
