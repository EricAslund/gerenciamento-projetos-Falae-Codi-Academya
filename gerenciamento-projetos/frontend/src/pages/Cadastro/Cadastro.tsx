import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Cadastro.css'
import api from '../../util/axiosConfig'

const Register: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !senha || !papel) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const response = await api.post('/auth/register', { nome, email, senha, papel });
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.removeItem('usuariosCache');

      toast.success('Registro realizado com sucesso! ');
      navigate('/gestaoProjetos');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erro ao registrar. Tente novamente.';
        toast.error(errorMessage);
      } else {
        console.error('Erro desconhecido ao registrar:', error);
        toast.error('Erro desconhecido. Tente novamente.');
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Registrar</h2>
      <form onSubmit={handleRegister} className="register-form">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input-field"
        />
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
        <select
          value={papel}
          onChange={(e) => setPapel(e.target.value)}
          className="input-field"
        >
          <option value="">Selecione um papel</option>
          <option value="Desenvolvedor">Desenvolvedor</option>
          <option value="Gerente">Gerente</option>
          <option value="Tester">Tester</option>
        </select>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" className="register-button">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
