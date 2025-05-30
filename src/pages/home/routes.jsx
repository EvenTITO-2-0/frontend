import { Route, Routes } from 'react-router-dom'
import HomePage from '.'
import LayoutHome from './layout'
import MyEventsPage from './my-events'
import PublicEventsPage from './public-events'
import {
  BASE_URL,
  MY_EVENTS_URL,
  PUBLIC_EVENTS_URL,
} from './_components/constants'

export default function RoutesHome() {
  return (
    <Routes>
      <Route path={BASE_URL} element={<LayoutHome />}>
        <Route index element={<HomePage />} />
        <Route path={MY_EVENTS_URL} element={<MyEventsPage />} />
        <Route path={PUBLIC_EVENTS_URL} element={<PublicEventsPage />} />
      </Route>
    </Routes>
  )
}
