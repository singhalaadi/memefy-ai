import { BrowserRouter as Router } from 'react-router-dom'
import ConfigurationStatus from './components/common/ConfigurationStatus'
import Layout from './components/layout/Layout'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <Router>
      <ConfigurationStatus />
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  )
}

export default App