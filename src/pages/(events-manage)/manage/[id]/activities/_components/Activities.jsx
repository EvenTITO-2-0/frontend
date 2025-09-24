import SubtitlePage from '@/pages/(events-manage)/_components/subtitlePage'
import ActivityCard from './ActivityCard'
import { getActivitiesForDay, getIntermediateDates, ShowDay } from './utils'
import AddDateButton from './AddDateButton'
import Icon from '@/components/Icon'

export default function Activities({
  startDate,
  endDate,
  informativeDates,
  onAddNewDate,
  onEditDate,
}) {
  if (!startDate || !endDate) {
    return <NoDatesMessage />
  }

  const days = getIntermediateDates(startDate, endDate)

  return (
    <div className="space-y-6">
      {days.map((day, index) => (
        <>
          <SubtitlePage subtitle={ShowDay(day, index + 1)} />
          <ShowActivitiesForDay
            activities={getActivitiesForDay(day, informativeDates)}
            onEditDate={onEditDate}
          />
          <AddDateButton day={day} onAddNewDate={onAddNewDate} />
        </>
      ))}
    </div>
  )
}

function ShowActivitiesForDay({ activities, onEditDate }) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.title}
          activity={activity}
          onEditDate={onEditDate}
        />
      ))}
    </div>
  )
}

function NoDatesMessage() {
  return (
    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
      <Icon name="CalendarClock" />
      <p className="text-lg">
        Configura las fechas de inicio y fin de presentaciones para agregar
        actividades al evento.
      </p>
    </div>
  )
}
