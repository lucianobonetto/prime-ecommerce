import React, { useState, useEffect } from 'react';
import { User, Package, LogOut, Edit3, CheckCircle, Clock, XCircle, MapPin, Plus, Trash2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard'; // NUEVO IMPORT PARA LAS TARJETAS

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { favorites } = useWishlist();
  
  // Estados para Perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: ""
  });

  // Estados para Pedidos y Direcciones
  const [pedidos, setPedidos] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  
  // Estados para el formulario de Direcciones
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    id: null, calle: '', numero: '', codigoPostal: '', ciudad: '', telefono: '', descripcion: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://127.0.0.1:8000/api/mi-perfil/', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json()).then(data => setUserProfile(data)).catch(() => {});

      fetch('http://127.0.0.1:8000/api/mis-pedidos/', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json()).then(data => setPedidos(data)).catch(() => {});

      fetch('http://127.0.0.1:8000/api/mis-direcciones/', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json()).then(data => setDirecciones(data)).catch(() => {});
    }
  }, [isAuthenticated, navigate]);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'pagado': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><Clock size={14}/> Preparando</span>;
      case 'entregado': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle size={14}/> Entregado</span>;
      case 'fallido': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle size={14}/> Fallido</span>;
      default: return <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pendiente</span>;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://127.0.0.1:8000/api/mi-perfil/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(userProfile)
        });
      } catch (error) { console.error(error); }
    }
    setIsEditingProfile(false);
  };

  const handleOpenAddressForm = (addr = null) => {
    if (addr) {
      setCurrentAddress(addr);
    } else {
      setCurrentAddress({ id: null, calle: '', numero: '', codigoPostal: '', ciudad: '', telefono: '', descripcion: '' });
    }
    setIsEditingAddress(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const isNew = !currentAddress.id;
    const url = isNew ? 'http://127.0.0.1:8000/api/mis-direcciones/' : `http://127.0.0.1:8000/api/mis-direcciones/${currentAddress.id}/`;
    const method = isNew ? 'POST' : 'PUT';

    if (token) {
      try {
        const res = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(currentAddress)
        });
        
        if (res.ok) {
          const updatedRes = await fetch('http://127.0.0.1:8000/api/mis-direcciones/', { headers: { 'Authorization': `Bearer ${token}` }});
          const updatedData = await updatedRes.json();
          setDirecciones(updatedData);
        }
      } catch (error) { console.error(error); }
    }
    setIsEditingAddress(false);
  };

  const handleDeleteAddress = async (id) => {
    if(!window.confirm("¿Seguro que querés eliminar esta dirección?")) return;
    const token = localStorage.getItem('token');
    
    if (token) {
      await fetch(`http://127.0.0.1:8000/api/mis-direcciones/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDirecciones(direcciones.filter(d => d.id !== id));
    }
  };

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-6 min-h-screen flex flex-col md:flex-row gap-8">
      
      {/* MENÚ LATERAL */}
      <aside className="w-full md:w-72 flex-shrink-0">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-black uppercase">
              {userProfile.nombre ? userProfile.nombre.charAt(0) : ''}{userProfile.apellido ? userProfile.apellido.charAt(0) : ''}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{userProfile.nombre} {userProfile.apellido}</h2>
              <p className="text-xs text-gray-500 font-medium">{userProfile.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('pedidos')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'pedidos' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Package size={18} /> Mis Pedidos
            </button>
            <button onClick={() => setActiveTab('direcciones')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'direcciones' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <MapPin size={18} /> Mis Direcciones
            </button>
            
            {/* NUEVA PESTAÑA: FAVORITOS */}
            <button onClick={() => setActiveTab('favoritos')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'favoritos' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Heart size={18} className={activeTab === 'favoritos' ? 'fill-white text-white' : ''} /> 
              Mis Favoritos ({favorites.length})
            </button>

            <button onClick={() => setActiveTab('perfil')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'perfil' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <User size={18} /> Mi Perfil
            </button>
            
            <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all mt-4">
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1">
        
        {/* PESTAÑA: PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-2"><Package size={24}/> Historial de Pedidos</h2>
            <div className="space-y-4">
              {pedidos.length === 0 ? (
                <p className="text-gray-500">Aún no tienes pedidos registrados.</p>
              ) : (
                pedidos.map((pedido) => (
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
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: DIRECCIONES */}
        {activeTab === 'direcciones' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black flex items-center gap-2"><MapPin size={24}/> Libreta de Direcciones</h2>
              {!isEditingAddress && (
                <button onClick={() => handleOpenAddressForm()} className="flex items-center gap-2 text-sm font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                  <Plus size={16}/> Nueva
                </button>
              )}
            </div>

            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold mb-4">{currentAddress.id ? 'Editar Dirección' : 'Agregar Nueva Dirección'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Calle / Avenida *</label>
                    <input type="text" required value={currentAddress.calle} onChange={e => setCurrentAddress({...currentAddress, calle: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Número *</label>
                    <input type="text" required value={currentAddress.numero} onChange={e => setCurrentAddress({...currentAddress, numero: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Código Postal *</label>
                    <input type="text" required value={currentAddress.codigoPostal} onChange={e => setCurrentAddress({...currentAddress, codigoPostal: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Ciudad *</label>
                    <input type="text" required value={currentAddress.ciudad} onChange={e => setCurrentAddress({...currentAddress, ciudad: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Teléfono de contacto *</label>
                    <input type="tel" required value={currentAddress.telefono} onChange={e => setCurrentAddress({...currentAddress, telefono: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Descripción / Referencia (Opcional)</label>
                    <input type="text" value={currentAddress.descripcion} onChange={e => setCurrentAddress({...currentAddress, descripcion: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-black text-white font-bold py-3 rounded-xl text-sm transition-colors hover:bg-gray-800">Guardar</button>
                  <button type="button" onClick={() => setIsEditingAddress(false)} className="px-6 bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors hover:bg-gray-300">Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {direcciones.length === 0 ? (
                  <p className="text-gray-500 col-span-2">No tenés direcciones guardadas.</p>
                ) : (
                  direcciones.map(dir => (
                    <div key={dir.id} className="border border-gray-100 p-5 rounded-2xl flex flex-col justify-between hover:border-gray-300 transition-colors">
                      <div>
                        <h4 className="font-bold text-black mb-1">{dir.calle} {dir.numero}</h4>
                        <p className="text-sm text-gray-600 mb-1">{dir.ciudad}, CP {dir.codigoPostal}</p>
                        <p className="text-xs text-gray-500 mb-2">📞 {dir.telefono}</p>
                        {dir.descripcion && <p className="text-xs text-gray-400 italic">"{dir.descripcion}"</p>}
                      </div>
                      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                        <button onClick={() => handleOpenAddressForm(dir)} className="text-blue-500 hover:text-blue-700 transition-colors"><Edit3 size={18}/></button>
                        <button onClick={() => handleDeleteAddress(dir.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* NUEVA PESTAÑA: FAVORITOS */}
        {activeTab === 'favoritos' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-2"><Heart size={24}/> Mis Favoritos</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Heart className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 font-medium">Aún no tienes productos guardados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: PERFIL */}
        {activeTab === 'perfil' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black flex items-center gap-2"><User size={24}/> Datos Personales</h2>
              {!isEditingProfile && (
                <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  <Edit3 size={16}/> Editar
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Nombre</label>
                  <input type="text" disabled={!isEditingProfile} value={userProfile.nombre} onChange={(e) => setUserProfile({...userProfile, nombre: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium disabled:opacity-60 focus:border-black focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Apellido</label>
                  <input type="text" disabled={!isEditingProfile} value={userProfile.apellido} onChange={(e) => setUserProfile({...userProfile, apellido: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium disabled:opacity-60 focus:border-black focus:ring-black" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Correo Electrónico</label>
                <input type="email" disabled={!isEditingProfile} value={userProfile.email} onChange={(e) => setUserProfile({...userProfile, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium disabled:opacity-60 focus:border-black focus:ring-black" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Teléfono Principal</label>
                <input type="tel" disabled={!isEditingProfile} value={userProfile.telefono} onChange={(e) => setUserProfile({...userProfile, telefono: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium disabled:opacity-60 focus:border-black focus:ring-black" />
              </div>

              {isEditingProfile && (
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-black text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors">Guardar Cambios</button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="px-8 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors">Cancelar</button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}