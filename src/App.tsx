import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './features/home/HomePage'
import ConstituencyListPage from './features/constituencies/ConstituencyListPage'
import ComparisonPage from './features/comparison/ComparisonPage'
import NotFound from './routes/NotFound'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="state/:stateId" element={<ConstituencyListPage />} />
        <Route
          path="compare/:stateId/:constituencyId"
          element={<ComparisonPage />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
