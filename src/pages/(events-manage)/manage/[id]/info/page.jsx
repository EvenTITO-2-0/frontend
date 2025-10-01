import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import FilePicker from '@/components/Modal/FilePickerModal'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'
import { getBanner, getLogo } from './_components/utils'
import { useEditEvent, useUploadEventImage } from '@/hooks/manage/generalHooks'
import DescriptionCard from './_components/DescriptionCard'
import MetadataCard from './_components/MetadataCard'
import StepNavigationButtons from '../administration/_components/StepNavigationButtons'

export default function Page({ eventInfo }) {
  const { mutateAsync: updateEvent } = useEditEvent()
  const { mutateAsync: uploadEventImage } = useUploadEventImage()

  async function handleUpdateImage(file, nameFile) {
    await uploadEventImage({ imageName: nameFile, image: file })
  }
  async function handleUpdateBanner(bannerFile) {
    await handleUpdateImage(bannerFile, 'banner_image')
  }
  async function handleUpdateLogo(logoFile) {
    await handleUpdateImage(logoFile, 'main_image')
  }

  async function updateEventInfo({ eventData }) {
    delete eventData.title
    await updateEvent({
      eventData,
    })
  }
  async function handleUpdateDescription(newDescription) {
    await updateEventInfo({
      eventData: {
        ...eventInfo,
        mdata: { ...eventInfo.mdata, description: newDescription },
      },
    })
  }
  async function handleUpdateShortDescription(newShortDescription) {
    await updateEventInfo({
      eventData: {
        ...eventInfo,
        mdata: { ...eventInfo.mdata, short_description: newShortDescription },
      },
    })
  }
  async function handleUpdateLocation(newLocation) {
    await updateEventInfo({
      eventData: {
        ...eventInfo,
        location: newLocation,
      },
    })
  }
  async function handleUpdateContact(newContact) {
    await updateEventInfo({
      eventData: {
        ...eventInfo,
        contact: newContact,
      },
    })
  }
  async function handleUpdateOrganizedBy(newOrganizedBy) {
    await updateEventInfo({
      eventData: {
        ...eventInfo,
        organized_by: newOrganizedBy,
      },
    })
  }

  return (
    <ContainerPage>
      <div className="space-y-6">
        <TitlePage title={eventInfo.title} />
        <div className="flex gap-4">
          <MetadataCard
            title="Ubicación"
            defaultValue={eventInfo.location}
            handleUpdate={handleUpdateLocation}
            logo="MapPin"
          />
          <MetadataCard
            title="Contacto"
            defaultValue={eventInfo.contact}
            handleUpdate={handleUpdateContact}
            logo="AtSign"
          />
          <MetadataCard
            title="Organizado por"
            defaultValue={eventInfo.organized_by}
            handleUpdate={handleUpdateOrganizedBy}
            logo="CircleUser"
          />
        </div>
        <FilePicker
          title="Banner"
          modalTitle="Seleccionar un banner para el evento"
          imageURL={getBanner(eventInfo)}
          onSave={handleUpdateBanner}
        />
        <FilePicker
          title="Logo"
          modalTitle="Seleccionar un logo para el evento"
          imageURL={getLogo(eventInfo)}
          onSave={handleUpdateLogo}
        />
        <DescriptionCard
          title="Descripción corta"
          descriptionText={
            eventInfo.mdata?.short_description || 'Sin descripción'
          }
          defaultValue={eventInfo.mdata?.short_description}
          handleUpdate={handleUpdateShortDescription}
          maxValue={200}
        />
        <DescriptionCard
          title="Acerca del evento"
          descriptionText={eventInfo.mdata?.description || 'Sin descripción'}
          defaultValue={eventInfo.mdata?.description}
          handleUpdate={handleUpdateDescription}
        />
        <StepNavigationButtons currentStep="info" eventInfo={eventInfo} />
      </div>
    </ContainerPage>
  )
}
