import { ArrowLeft } from 'lucide-react'
import LineTabs from '@/components/LineTabs'
import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'
import { useNavigator } from '@/lib/navigation'
import { DetailsTab } from './details'
import Reviews from './reviews'
import StatusSelector from './_components/StatusSelector'
import { useGetWorkDownloadURL } from '@/hooks/events/worksHooks'
import {
  useSubmitChairReview,
  useUpdateReviewDeadlineForReviewer,
} from '@/hooks/events/chairHooks'

export default function Page({ selectedWork, reviews, reviewers }) {
  const navigator = useNavigator('/works')
  const { mutate: downloadWorkFile, isPending } = useGetWorkDownloadURL()
  const chairReview = useSubmitChairReview(reviews)
  const updateReviewDeadlineForReviewer = useUpdateReviewDeadlineForReviewer()

  function handleBack(e) {
    e.preventDefault()
    navigator.back()
  }

  function onSubmit() {
    navigator.back()
  }

  return (
    <ContainerPage>
      <a
        href="#"
        onClick={handleBack}
        className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a tracks
      </a>
      <TitlePage
        title={selectedWork.title}
        rightComponent={
          <StatusSelector
            submitChairReview={chairReview.mutateAsync}
            isPending={chairReview.isPending}
            onSubmit={onSubmit}
            hasReviews={reviews && reviews.length > 0}
          />
        }
      />

      <div className="mb-6">
        <LineTabs
          tabs={[
            {
              label: 'Entrega',
              component: (
                <DetailsTab
                  handleBack={handleBack}
                  selectedWork={selectedWork}
                  getFileData={downloadWorkFile}
                  isPending={isPending}
                />
              ),
            },
            {
              label: 'Revisiones',
              component: (
                <Reviews
                  reviews={reviews}
                  reviewers={reviewers}
                  updateReviewDeadline={updateReviewDeadlineForReviewer.mutate}
                />
              ),
            },
          ]}
        />
      </div>
    </ContainerPage>
  )
}
