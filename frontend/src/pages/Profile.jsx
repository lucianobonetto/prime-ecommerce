import React, { useState, useEffect } from 'react';
import { User, Package, LogOut, Edit3, CheckCircle, Clock, XCircle } from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const [isEditing, setIsEditing] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  
  const [userProfile, setUserProfile] = useState({
    nombre: "Tomás",
    apellido: "Desarrollador",
    email: "tomas@primelogic.com",
    telefono: "+54 9 261 123 4567",
    direccion: "Godoy Cruz, Mendoza"
  });

  // Efecto para buscar datos reales en Django
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Si hay token, traemos los datos reales
      fetch('http://127.0.0.1:8000/api/mi-perfil/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setUserProfile(data))
      .catch(err => console.log("Usando mock data para perfil"));

      fetch('http://127.0.0.1:8000/api/mis-pedidos/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setPedidos(data))
      .catch(err => console.log("Usando mock data para pedidos"));
    } else {
      // Mock data si no hay sesión
      setPedidos([
        { id: 1042, fecha: "2026-03-15", total_final: 150000, estado: "pagado", items_resumen: "Campera de Cuero (M) x1" },
        { id: 1041, fecha: "2026-03-01", total_final: 45000, estado: "entregado", items_resumen: "Remera Oversize (L) x2" },
      ]);
    }
  }, []);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'pagado': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><Clock size={14}/> Preparando</span>;
      case 'entregado': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle size={14}/> Entregado</span>;
      case 'fallido': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle size={14}/> Fallido</span>;
      default: return <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pendiente</span>;
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        await fetch('http://127.0.0.1:8000/api/mi-perfil/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userProfile)
        });
        alert("Perfil actualizado en la base de datos.");
      } catch (error) {
        alert("Error al guardar en el servidor.");
      }
    } else {
      alert("Perfil guardado localmente (Simulación).");
    }
    setIsEditing(false);
  };

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-6 min-h-screen flex flex-col md:flex-row gap-8">
      {/* MENÚ LATERAL */}
      <aside className="w-full md:w-72 flex-shrink-0">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-black uppercase">
              {userProfile.nombre.charAt(0)}{userProfile.apellido.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{userProfile.nombre} {userProfile.apellido}</h2>
              <p className="text-xs text-gray-500 font-medium">{userProfile.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'pedidos' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package size={18} /> Mis Pedidos
            </button>
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'perfil' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <User size={18} /> Mi Perfil
            </button>
            <button className="flex items-center gap-3 p-4 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all mt-4">
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1">
        {activeTab === 'pedidos' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-2"><Package size={24}/> Historial de Pedidos</h2>
            
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-300 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-black text-lg">Pedido #{pedido.id}</span>
                      {getStatusBadge(pedido.estado)}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Fecha: {new Date(pedido.fecha).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-gray-700">{pedido.items_resumen}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total abonado</p>
                    <p className="font-black text-xl">{formatPrice(pedido.total_final)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black flex items-center gap-2"><User size={24}/> Datos Personales</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  <Edit3 size={16}/> Editar
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Nombre</label>
                  <input type="text" disabled={!isEditing} value={userProfile.nombre} onChange={(e) => setUserProfile({...userProfile, nombre: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium disabled:opacity-60 focus:border-black focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Apellido</label>
                  <input type="text" disabled={!isEditing} value={userProfile.apellido} onChange={(e) => setUserProfile({...userProfile, apellido: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium disabled:opacity-60 focus:border-black focus:ring-black" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Correo Electrónico</label>
                <input type="email" disabled={!isEditing} value={userProfile.email} onChange={(e) => setUserProfile({...userProfile, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium disabled:opacity-60 focus:border-black focus:ring-black" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Teléfono</label>
                <input type="tel" disabled={!isEditing} value={userProfile.telefono} onChange={(e) => setUserProfile({...userProfile, telefono: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium disabled:opacity-60 focus:border-black focus:ring-black" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Dirección de Envío</label>
                <input type="text" disabled={!isEditing} value={userProfile.direccion} onChange={(e) => setUserProfile({...userProfile, direccion: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium disabled:opacity-60 focus:border-black focus:ring-black" />
              </div>

              {isEditing && (
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-black text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors">Guardar Cambios</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-8 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors">Cancelar</button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}