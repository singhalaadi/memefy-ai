import { BrowserRouter as Router } from 'react-router-dom'
import ScrollToTop from './components/common/ScrollToTop'
import Layout from './components/layout/Layout'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  )
}

export default App