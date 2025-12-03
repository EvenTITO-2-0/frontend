import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'

export default function SpeakersList({ works, onSpeakerClick }) {
  const speakers = works.reduce((acc, work) => {
    work.speaker.forEach((speaker) => {
      if (!acc[speaker.mail]) {
        acc[speaker.mail] = { ...speaker, works: [] }
      }
      acc[speaker.mail].works.push(work)
    })
    return acc
  }, {})

  if (Object.values(speakers).length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">
          Ninguna presentación disponible{' '}
        </h2>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.values(speakers).map((speaker) => (
        <Card
          key={speaker.mail}
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onSpeakerClick(speaker)}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${speaker.full_name}`}
                />
                <AvatarFallback>
                  {speaker.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{speaker.full_name}</h3>
                <p className="text-sm text-gray-500">{speaker.mail}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Badge variant="secondary">{speaker.works.length} entregas</Badge>
              <ChevronRight className="ml-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
