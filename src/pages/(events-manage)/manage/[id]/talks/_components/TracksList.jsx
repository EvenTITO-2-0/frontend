import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'

export default function TracksList({ works, onTrackClick }) {
    const tracks = works.reduce((acc, work) => {
        const trackName = work.track || 'Sin Track'
        if (!acc[trackName]) {
            acc[trackName] = { name: trackName, works: [] }
        }
        acc[trackName].works.push(work)
        return acc
    }, {})

    if (Object.values(tracks).length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-2">
                    Ninguna presentación disponible
                </h2>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {Object.values(tracks).map((track) => (
                <Card
                    key={track.name}
                    className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => onTrackClick(track)}
                >
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${track.name}`}
                                />
                                <AvatarFallback>
                                    {track.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium">{track.name}</h3>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Badge variant="secondary">{track.works.length} entregas</Badge>
                            <ChevronRight className="ml-2" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
