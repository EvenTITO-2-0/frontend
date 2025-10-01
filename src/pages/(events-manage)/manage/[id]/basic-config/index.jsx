import Page from './page'
import { useEvent } from '@/lib/layout'

export default function BasicConfigPage() {
  const eventData = useEvent()

  return <Page eventInfo={eventData} />
}
