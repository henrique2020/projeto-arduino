import { Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/Header/Header'
import Footer from './components/Footer/Footer'
import { ToastProvider } from './context/ToastContext'
import HomeScreen from './screens/HomeScreen/HomeScreen'
import ItensCadastradosScreen from './screens/ItensCadastradosScreen/ItensCadastradosScreen'
import ItensPendentesScreen from './screens/ItensPendentesScreen/ItensPendentesScreen'
import HistoricoScreen from './screens/HistoricoScreen/HistoricoScreen'
import './App.css'

function App() {
  return (
    <ToastProvider>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/itens-cadastrados" element={<ItensCadastradosScreen />} />
          <Route path="/itens-pendentes" element={<ItensPendentesScreen />} />
          <Route path="/historico" element={<HistoricoScreen />} />
          <Route path="/historico/:item_ref" element={<HistoricoScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </ToastProvider>
  )
}

export default App
