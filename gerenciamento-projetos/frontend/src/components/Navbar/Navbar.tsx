import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Navbar.css';
import api from '../../util/axiosConfig';
import { useAuth } from '../../util/AuthContext';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { usuarioAutenticado, setUsuarioAutenticado } = useAuth();

  const handleLogin = ( )=>{
    const token = localStorage.getItem('token');
    if (token) {
      // Busca as informações do usuário autenticado
      api.get('/auth/me')
        .then((response) => {
          setUsuarioAutenticado(response.data);
        })
        .catch((error) => {
          console.error('Erro ao buscar dados do usuário:', error);
          toast.error('Erro ao buscar dados do usuário. Tente novamente.');
        });
    }
  }
  useEffect(() => {
    // Verifica se o token está presente no localStorage
    handleLogin()
  }, [usuarioAutenticado]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token
    setUsuarioAutenticado(null); // Remove o usuário autenticado
    navigate('/login'); // Redireciona para a página de login
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <ul className="navbar-links">
          <li>
            <button className="nav-button" onClick={() => navigate('/gestaoProjetos')}>
              Gestão de Projetos
            </button>
          </li>
          <li>
            <button className="nav-button" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          </li>
        </ul>

        <div className="navbar-buttons">
          {usuarioAutenticado ? (
            <div className="user-info">
              <span className="user-name mr-4">{usuarioAutenticado.nome}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          ) : (
            <Link to="/login">
              <button className="login-button">Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
