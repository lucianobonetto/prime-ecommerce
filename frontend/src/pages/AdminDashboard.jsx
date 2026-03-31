import React, { useState, useEffect } from 'react';
import { Package, Users, Tag, LayoutDashboard, CheckCircle, Clock, XCircle, Edit3, Trash2, Plus, Search, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Para cambiar el estado de los pedidos
  const [editingPedido, setEditingPedido] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');

  const token = localStorage.getItem('token');

  // Cargar datos según la pestaña activa
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setIsLoading(true);
    try {
      let url = '';
      if (tab === 'pedidos') url = 'http://127.0.0.1:8000/api/admin/pedidos/';
      if (tab === 'usuarios') url = 'http://127.0.0.1:8000/api/admin/usuarios/';
      if (tab === 'productos') url = 'http://127.0.0.1:8000/api/productos/';
      if (tab === 'categorias') url = 'http://127.0.0.1:8000/api/categorias/';

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar estado de un pedido
  const handleActualizarPedido = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/pedidos/${id}/estado/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        setEditingPedido(null);
        fetchData('pedidos'); // Recargar la lista
      }
    } catch (error) {
      console.error("Error actualizando pedido:", error);
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'pagado': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"><Clock size={12}/> Pagado</span>;
      case 'enviado': return <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"><Truck size={12}/> Enviado</span>;
      case 'entregado': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"><CheckCircle size={12}/> Entregado</span>;
      case 'fallido': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"><XCircle size={12}/> Fallido</span>;
      default: return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Pendiente</span>;
    }
  };

  return (
    <div className="pt-28 pb-16 max-w-[1400px] mx-auto px-6 min-h-screen flex flex-col md:flex-row gap-8">
      
      {/* MENÚ LATERAL ADMIN */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Panel de Control</h2>
          <nav className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('pedidos')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'pedidos' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Package size={18} /> Gestión de Pedidos
            </button>
            <button onClick={() => setActiveTab('usuarios')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'usuarios' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Users size={18} /> Base de Clientes
            </button>
            <button onClick={() => setActiveTab('productos')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'productos' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Tag size={18} /> Catálogo
            </button>
            <button onClick={() => setActiveTab('categorias')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'categorias' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <LayoutDashboard size={18} /> Categorías
            </button>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* HEADER DE LA SECCIÓN */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h1 className="text-2xl font-black capitalize tracking-tight text-black flex items-center gap-3">
              {activeTab}
              {isLoading && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Administra la información de tu e-commerce</p>
          </div>
          
          {(activeTab === 'productos' || activeTab === 'categorias') && (
            <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
              <Plus size={16} /> Nuevo
            </button>
          )}
        </div>

        {/* TABLA DE DATOS */}
        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 font-medium">Cargando información...</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-medium">No hay registros para mostrar en esta sección.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              
              {/* --- RENDER DE PEDIDOS --- */}
              {activeTab === 'pedidos' && (
                <>
                  <thead className="bg-gray-50/80 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="p-5">ID / Fecha</th>
                      <th className="p-5">Cliente</th>
                      <th className="p-5">Resumen</th>
                      <th className="p-5">Envío</th>
                      <th className="p-5">Estado</th>
                      <th className="p-5 text-right">Total</th>
                      <th className="p-5 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {data.map(pedido => (
                      <tr key={pedido.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-5">
                          <span className="font-black text-black block">#{pedido.id}</span>
                          <span className="text-xs text-gray-400">{new Date(pedido.fecha).toLocaleDateString()}</span>
                        </td>
                        <td className="p-5 font-medium">{pedido.usuario}</td>
                        <td className="p-5 text-xs text-gray-500 max-w-[200px] truncate" title={pedido.items_resumen}>{pedido.items_resumen}</td>
                        <td className="p-5 text-xs">
                          <span className="font-bold block uppercase tracking-wider">{pedido.metodo_envio}</span>
                          <span className="text-gray-400 truncate block max-w-[150px]" title={pedido.direccion}>{pedido.direccion}</span>
                        </td>
                        <td className="p-5">
                          {editingPedido === pedido.id ? (
                            <select 
                              className="bg-white border border-gray-200 rounded-md text-xs font-bold p-1"
                              value={nuevoEstado}
                              onChange={(e) => setNuevoEstado(e.target.value)}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="pagado">Pagado</option>
                              <option value="enviado">Enviado</option>
                              <option value="entregado">Entregado</option>
                              <option value="fallido">Fallido</option>
                            </select>
                          ) : (
                            getStatusBadge(pedido.estado)
                          )}
                        </td>
                        <td className="p-5 text-right font-black text-black">{formatPrice(pedido.total_final)}</td>
                        <td className="p-5 text-center">
                          {editingPedido === pedido.id ? (
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => handleActualizarPedido(pedido.id)} className="text-green-600 hover:bg-green-50 p-1 rounded-md"><CheckCircle size={16}/></button>
                              <button onClick={() => setEditingPedido(null)} className="text-red-500 hover:bg-red-50 p-1 rounded-md"><XCircle size={16}/></button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingPedido(pedido.id); setNuevoEstado(pedido.estado); }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors inline-flex">
                              <Edit3 size={16}/>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* --- RENDER DE USUARIOS --- */}
              {activeTab === 'usuarios' && (
                <>
                  <thead className="bg-gray-50/80 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="p-5">Usuario</th>
                      <th className="p-5">Email</th>
                      <th className="p-5">Teléfono</th>
                      <th className="p-5">Direcciones</th>
                      <th className="p-5 text-center">Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {data.map(usuario => (
                      <tr key={usuario.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-5 font-bold text-black flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black uppercase text-gray-500">
                            {usuario.nombre ? usuario.nombre.charAt(0) : usuario.email.charAt(0)}
                          </div>
                          {usuario.nombre || 'Sin nombre'}
                        </td>
                        <td className="p-5 text-gray-600">{usuario.email}</td>
                        <td className="p-5 text-gray-500">{usuario.telefono}</td>
                        <td className="p-5">
                          {usuario.direcciones_guardadas.length > 0 ? (
                            <span className="text-xs text-gray-500 block max-w-[200px] truncate" title={usuario.direcciones_guardadas[0]}>
                              {usuario.direcciones_guardadas[0]} {usuario.direcciones_guardadas.length > 1 ? `(+${usuario.direcciones_guardadas.length - 1})` : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Ninguna</span>
                          )}
                        </td>
                        <td className="p-5 text-center">
                          {usuario.is_admin ? (
                            <span className="bg-black text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Admin</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Cliente</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* --- RENDER DE PRODUCTOS (VISTA BÁSICA) --- */}
              {activeTab === 'productos' && (
                <>
                  <thead className="bg-gray-50/80 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="p-5">Producto</th>
                      <th className="p-5">Categoría</th>
                      <th className="p-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {data.map(prod => (
                      <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-5 font-bold text-black flex items-center gap-4">
                          <img src={prod.image || 'https://via.placeholder.com/40'} alt={prod.nombre} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                          {prod.nombre}
                        </td>
                        <td className="p-5 text-gray-500">{prod.categoria?.nombre || 'General'}</td>
                        <td className="p-5 text-right">
                          <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors mr-2"><Edit3 size={16}/></button>
                          <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* --- RENDER DE CATEGORÍAS (VISTA BÁSICA) --- */}
              {activeTab === 'categorias' && (
                <>
                  <thead className="bg-gray-50/80 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="p-5">ID</th>
                      <th className="p-5">Nombre de Categoría</th>
                      <th className="p-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {data.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-5 font-bold text-gray-400">#{cat.id}</td>
                        <td className="p-5 font-bold text-black">{cat.nombre}</td>
                        <td className="p-5 text-right">
                          <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors mr-2"><Edit3 size={16}/></button>
                          <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

            </table>
          )}
        </div>
      </div>
    </div>
  );
}