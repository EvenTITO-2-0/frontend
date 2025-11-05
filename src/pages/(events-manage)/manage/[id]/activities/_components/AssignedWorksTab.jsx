import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function AssignedWorksTab({ works }) {
  if (!works?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No works assigned to this slot
      </div>
    )
  }
  console.log("Assigned works tab")
  return (
    <ScrollArea className="h-[440px] w-full rounded-md border p-4">
      {works.map((work) => (
        <div key={work.id} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{work.title}</h4>
            <Badge>{work.track}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{work?.authors?.join(", ")}</p>
        </div>
      ))}
    </ScrollArea>
  )
}
