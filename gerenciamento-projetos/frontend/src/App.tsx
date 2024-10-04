import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Gestao_Projetos from './pages/GestaoProjetos/Gestao_Projetos';
import UsuariosProjeto from './pages/UsuariosProjetos/UsuariosProjeto';
import Navbar from './components/Navbar/Navbar';  // Importe a Navbar
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard/Dashboard';
import { AuthProvider } from './util/AuthContext';

function App() {
  useEffect(() => {
    const handleUnload = () => {
      // Remove token do localStorage ou sessionStorage
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    };

    // Adiciona o listener para o evento 'beforeunload'
    window.addEventListener('beforeunload', handleUnload);

    // Limpa o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);
  return (
    <AuthProvider>
    <Router>
      <Navbar />
      <ToastContainer />
      {/* <Dashboard/> */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/projetos/:projetoId/usuarios" element={<ProtectedRoute><UsuariosProjeto/></ProtectedRoute>} />
        <Route path="/gestaoProjetos" element={<ProtectedRoute><Gestao_Projetos /></ProtectedRoute>} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
