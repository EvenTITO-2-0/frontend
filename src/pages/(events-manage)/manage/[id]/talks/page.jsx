import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SpeakersList from './_components/SpeakersList'
import SpeakerDialog from './_components/SpeakerDialog'
import { useChangeTalkForWork } from '@/hooks/manage/talksHooks'
import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'

export default function Page({ works, rooms }) {
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)
  const [selectedWork, setSelectedWork] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { mutateAsync: updateTalkForWork } = useChangeTalkForWork()

  const handleSpeakerClick = (speaker) => {
    setSelectedSpeaker(speaker)
    setSelectedWork(null)
    setIsDialogOpen(true)
  }

  const handleWorkClick = (work) => {
    setSelectedWork(work)
    setSelectedSpeaker(work.speaker[0])
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedSpeaker(null)
    setSelectedWork(null)
  }

  const handleSaveWork = async (workId, track, talk) => {
    await updateTalkForWork({ workId, track, talk })
  }

  return (
    <ContainerPage>
      <TitlePage title={'Entregas'} />
      <Tabs defaultValue="speakers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="speakers">Presentadores</TabsTrigger>
        </TabsList>
        <TabsContent value="speakers">
          <SpeakersList works={works} onSpeakerClick={handleSpeakerClick} />
        </TabsContent>
      </Tabs>

      <SpeakerDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveWork}
        speaker={selectedSpeaker}
        selectedWork={selectedWork}
        rooms={rooms}
      />
    </ContainerPage>
  )
}
