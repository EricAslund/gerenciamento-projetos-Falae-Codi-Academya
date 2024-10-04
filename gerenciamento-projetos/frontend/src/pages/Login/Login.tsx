import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Login.css'
import api from '../../util/axiosConfig'
import { useAuth } from '../../util/AuthContext';

const Login: React.FC = () => {
  const { setUsuarioAutenticado } = useAuth(); 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email || !senha) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }
    try {
      const response = await api.post('/auth/login', { email, senha });
      localStorage.setItem('token', response.data.token); 
      setUsuarioAutenticado(response.data);
      toast.success('Login realizado com sucesso!');  
      navigate('/gestaoProjetos'); // Redireciona para o Gerenciamento de projetos
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erro ao fazer login. Tente novamente.';
        toast.error(errorMessage);
      } else {
        toast.error('Erro desconhecido ao fazer login.');
      }
    }
  };

  const handleNavigateToRegister = () => {
    navigate('/cadastro'); // Redireciona para a página de cadastro
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input-field"
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" className="login-button">Entrar</button>
        <button onClick={handleNavigateToRegister} className="register-button">Cadastre-se</button>
      </form>
      
    </div>
  );
};

export default Login;
