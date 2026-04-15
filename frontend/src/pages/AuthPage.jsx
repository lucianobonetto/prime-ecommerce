import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nombre: '',
    apellido: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access); 
        setSuccess("Inicio de sesión exitoso. Redirigiendo...");
        // Reducimos drásticamente el tiempo de espera para que se sienta fluido
        setTimeout(() => navigate('/perfil'), 400); 
      } else {
        // Pisamos el error por defecto de Django por tu frase personalizada
        setError("Combinación incorrecta, correo o contraseña erróneas.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  const handleRegister = async () => {
    if (formData.password !== formData.passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/registro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          password_confirm: formData.passwordConfirm,
          nombre: formData.nombre,
          apellido: formData.apellido
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Cuenta creada con éxito. Ya podés iniciar sesión.");
        setFormData({ email: '', password: '', passwordConfirm: '', nombre: '', apellido: '' });
        setTimeout(() => {
          setSuccess(null);
          setIsLogin(true);
        }, 2500);
      } else {
        setError(data.error || "Ocurrió un error al registrarse.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="flex border-b border-gray-100">
          <button onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }} className={`flex-1 py-5 font-black text-sm uppercase tracking-widest transition-colors ${isLogin ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-black hover:bg-white'}`}>
            Iniciar Sesión
          </button>
          <button onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }} className={`flex-1 py-5 font-black text-sm uppercase tracking-widest transition-colors ${!isLogin ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-black hover:bg-white'}`}>
            Registrarse
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-black text-black mb-2">{isLogin ? '¡Hola de nuevo!' : 'Creá tu cuenta'}</h2>
          <p className="text-sm text-gray-500 mb-8">{isLogin ? 'Ingresá tus credenciales para acceder a tu perfil y pedidos.' : 'Unite a Prime Logic LT y gestioná tus compras.'}</p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm font-medium">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              <CheckCircle size={18} />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Nombre</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required={!isLogin} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-black focus:ring-black" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Apellido</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required={!isLogin} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:border-black focus:ring-black" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Correo Electrónico</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="usuario@gmail.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-black focus:ring-black" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder={isLogin ? "••••••••" : "Mínimo 8 caracteres"} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-black focus:ring-black" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} required={!isLogin} placeholder="Repetir contraseña" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-black focus:ring-black" />
                </div>
              </div>
            )}

            <button type="submit" disabled={isLoading} className={`w-full py-4 mt-6 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-md flex justify-center items-center gap-2 ${isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#009EE3] text-white hover:bg-[#008ACB] active:scale-95'}`}>
              {isLoading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Crear Cuenta'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}