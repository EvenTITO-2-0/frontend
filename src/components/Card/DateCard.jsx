import { DatePicker } from '@nextui-org/date-picker'
import MiniModal from '@/components/Modal/MiniModal'
import { useState } from 'react'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { formatDayToText } from '@/lib/dates'
import CardWithFocus from './CardWithFocus'

export default function DateCard({ date, label, onEdit }) {
  const defaultDate = today(getLocalTimeZone())
  const [selectedDate, setSelectedDate] = useState(
    date ? parseDate(date) : defaultDate
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (onClose) => {
    if (selectedDate) {
      setIsLoading(true)
      await onEdit({
        newDate: selectedDate.toLocaleString(),
      })
      setIsLoading(false)
      onClose(false)
    }
  }

  function trigger(onOpen) {
    return <RenderDateCard onOpen={onOpen} label={label} date={date} />
  }

  return (
    <MiniModal
      trigger={trigger}
      title={label}
      onSubmit={handleSubmit}
      isPending={isLoading}
    >
      <DatePicker
        label={label}
        className=""
        value={selectedDate}
        onChange={setSelectedDate}
      />
    </MiniModal>
  )
}

function RenderDateCard({ onOpen, label, date }) {
  return (
    <CardWithFocus nameIcon="CalendarIcon" onClick={onOpen}>
      <div className="flex-grow">
        <h2 className="text-sm font-medium text-foreground">{label}</h2>
        {date ? (
          <p className="text-sm text-muted-foreground">
            {formatDayToText(date)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Haz clic para configurar
          </p>
        )}
      </div>
    </CardWithFocus>
  )
}