import { useEvent } from '@/lib/layout.js'
import Page from '@/pages/(events-manage)/manage/[id]/calendar/page.jsx'

export default function CalendarConfigPage() {
  const eventData = useEvent()
  return <Page event={eventData}/>
}