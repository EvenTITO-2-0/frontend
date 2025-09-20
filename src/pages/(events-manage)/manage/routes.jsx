import { Route, Routes } from 'react-router-dom'
import LayoutOrganization from './layout'
import MembersConfigPage from './[id]/members'
import ReviewsConfigPage from './[id]/reviews'
import TracksConfigPage from './[id]/tracks'
import PricingConfigPage from './[id]/pricing'
import RoomsConfigPage from './[id]/rooms'
import InscriptionsDataPage from './[id]/inscriptions'
import TalksDataPage from './[id]/talks'
import OrganizerActivitiesPage from './[id]/activities'
import InfoConfigPage from './[id]/info'
import AdminConfigPage from './[id]/administration'
import PaymentsConfigPage from './[id]/payments/page'

export default function RoutesOrganization() {
  return (
    <Routes>
      <Route path="/manage" element={<LayoutOrganization />}>
        <Route
          path="/manage/:id/administration"
          element={<AdminConfigPage />}
        />
        <Route path="/manage/:id/" element={<AdminConfigPage />} />
        <Route path="/manage/:id/general" element={<AdminConfigPage />} />
        <Route path="/manage/:id/view" element={<AdminConfigPage />} />
        <Route path="/manage/:id/info" element={<InfoConfigPage />} />
        <Route path="/manage/:id/members" element={<MembersConfigPage />} />
        <Route path="/manage/:id/reviews" element={<ReviewsConfigPage />} />
        <Route path="/manage/:id/tracks" element={<TracksConfigPage />} />
        <Route path="/manage/:id/pricing" element={<PricingConfigPage />} />
        <Route path="/manage/:id/rooms" element={<RoomsConfigPage />} />
        <Route path="/manage/:id/payments" element={<PaymentsConfigPage />} />
        <Route
          path="/manage/:id/inscriptions"
          element={<InscriptionsDataPage />}
        />
        <Route path="/manage/:id/talks" element={<TalksDataPage />} />
        <Route
          path="/manage/:id/activities"
          element={<OrganizerActivitiesPage />}
        />
      </Route>
    </Routes>
  )
}
