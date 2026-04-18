import React, { useState, useEffect } from 'react';
import { Package, Users, Tag, LayoutDashboard, CheckCircle, Clock, XCircle, Edit3, Trash2, Plus, Search, Truck, ShoppingCart, Filter, Calendar, DollarSign, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/ProductForm';
import CategoryForm from '../components/CategoryForm';
import { toast } from 'sonner';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editingPedido, setEditingPedido] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');

  const [productoAEditar, setProductoAEditar] = useState(null);
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  const [compraData, setCompraData] = useState({ producto_id: '', cantidad: '' });

  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');

  const token = localStorage.getItem('token');
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const hoy = new Date();
    const mesPasado = new Date();
    mesPasado.setMonth(hoy.getMonth() - 1);
    
    setFiltroHasta(hoy.toISOString().split('T')[0]);
    setFiltroDesde(mesPasado.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData(activeTab);
    }
  }, [activeTab, isAuthenticated]);

  const fetchData = async (tab) => {
    setIsLoading(true);
    setData([]); 
    try {
      let url = '';
      if (tab === 'pedidos') url = 'http://127.0.0.1:8000/api/admin/pedidos/';
      if (tab === 'usuarios') url = 'http://127.0.0.1:8000/api/admin/usuarios/';
      if (tab === 'categorias') url = 'http://127.0.0.1:8000/api/categorias/';
      if (tab === 'productos' || tab === 'compras') url = 'http://127.0.0.1:8000/api/admin/productos-completos/';

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (res.status === 401) {
        logout();
        return;
      }

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

  const handleActualizarPedido = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/pedidos/${id}/estado/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        setEditingPedido(null);
        fetchData('pedidos');
      }
    } catch (error) {
      console.error("Error actualizando pedido:", error);
    }
  };

  const handleDelete = async (id, tipo) => {
    if (!window.confirm(`¿Estás seguro de que querés eliminar este ${tipo}?`)) return;
    try {
      const endpoint = tipo === 'producto' ? 'productos' : 'categorias';
      const res = await fetch(`http://127.0.0.1:8000/api/${endpoint}/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        toast.success(`${tipo === 'producto' ? 'Producto' : 'Categoría'} eliminado con éxito.`);
        fetchData(activeTab);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || `Error al eliminar el ${tipo}.`);
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      toast.error("Error de conexión al intentar eliminar.");
    }
  };

  const handleToggleVisibilidad = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/productos/${id}/toggle-visibilidad/`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        logout(); return;
      }

      if (res.ok) {
        const data = await res.json();
        toast.success(data.mensaje);
        fetchData('productos'); 
      }
    } catch (error) {
      toast.error("Error de conexión al cambiar visibilidad.");
    }
  };

  const handleRegistrarCompra = async () => {
    try {
        const res = await fetch('http://127.0.0.1:8000/api/admin/sumar-stock/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(compraData)
        });
        
        if (res.status === 401) {
          logout();
          return;
        }

        if (res.ok) {
            toast.success("Ingreso de mercadería registrado con éxito");
            setCompraData({ producto_id: '', cantidad: '' });
            fetchData('compras'); 
        } else {
            toast.error("Error al actualizar el inventario");
        }
    } catch (e) {
        console.error(e);
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

  let pedidosFiltrados = [];
  let balanceTotalPagado = 0;

  if (activeTab === 'pedidos') {
    pedidosFiltrados = data.filter(pedido => {
      if (filtroEstado && pedido.estado !== filtroEstado) return false;
      
      const fechaPedido = new Date(pedido.fecha);
      if (filtroDesde) {
        const desde = new Date(`${filtroDesde}T00:00:00`);
        if (fechaPedido < desde) return false;
      }
      if (filtroHasta) {
        const hasta = new Date(`${filtroHasta}T23:59:59`);
        if (fechaPedido > hasta) return false;
      }
      
      return true;
    });

    balanceTotalPagado = pedidosFiltrados
      .filter(p => ['pagado', 'enviado', 'entregado'].includes(p.estado))
      .reduce((sum, p) => sum + parseFloat(p.total_final), 0);
  }

  return (
    <div className="pt-28 pb-16 max-w-[1400px] mx-auto px-6 min-h-screen flex flex-col md:flex-row gap-8">
      
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Panel de Control</h2>
          <nav className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('pedidos')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'pedidos' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}><Package size={18} /> Gestión de Pedidos</button>
            <button onClick={() => setActiveTab('compras')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'compras' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}><ShoppingCart size={18} /> Registrar Compra</button>
            <button onClick={() => setActiveTab('usuarios')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'usuarios' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}><Users size={18} /> Base de Clientes</button>
            <button onClick={() => setActiveTab('productos')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'productos' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}><Tag size={18} /> Catálogo</button>
            <button onClick={() => setActiveTab('categorias')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'categorias' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}><LayoutDashboard size={18} /> Categorías</button>
          </nav>
        </div>
      </aside>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h1 className="text-2xl font-black capitalize tracking-tight text-black flex items-center gap-3">
              {activeTab === 'compras' ? 'Ingreso de Mercadería' : activeTab}
              {isLoading && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Administra la información de tu e-commerce</p>
          </div>
          
          {(activeTab === 'productos' || activeTab === 'categorias') && (
            <button 
              onClick={() => { setProductoAEditar(null); setCategoriaAEditar(null); setIsAddingVariant(false); setShowForm(true); }} 
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
              ><Plus size={16} /> Nuevo
            </button>
          )}
        </div>

        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 font-medium">Cargando información...</div>
          ) : data.length === 0 && activeTab !== 'compras' ? (
            <div className="p-8 text-center text-gray-400 font-medium">No hay registros para mostrar en esta sección.</div>
          ) : (
            <div className="w-full">
              
              {activeTab === 'compras' && (
                <div className="p-8 max-w-xl mx-auto">
                  <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">1. Seleccionar Producto Existente</label>
                        <select 
                          className={`w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-colors ${!compraData.producto_id ? 'text-gray-400' : 'text-black'}`}
                          value={compraData.producto_id}
                          onChange={(e) => setCompraData({...compraData, producto_id: e.target.value})}
                        >
                          <option value="" disabled className="text-gray-400">Buscar en catálogo...</option>
                          {data.map(p => <option key={p.id} value={p.id} className="text-black">{p.nombre} (Stock actual: {p.stock})</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">2. Unidades compradas</label>
                        <input 
                          type="number" min="1" placeholder="Ej: 50"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
                          value={compraData.cantidad}
                          onChange={(e) => setCompraData({...compraData, cantidad: e.target.value})}
                        />
                      </div>
                      
                      <button 
                        onClick={handleRegistrarCompra}
                        disabled={!compraData.producto_id || compraData.cantidad <= 0}
                        className="w-full bg-green-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-green-700 disabled:bg-gray-300 transition-all shadow-md"
                      >
                        Sumar al Inventario
                      </button>

                      <div className="relative flex py-5 items-center">
                          <div className="flex-grow border-t border-gray-200"></div>
                          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">¿El producto no existe?</span>
                          <div className="flex-grow border-t border-gray-200"></div>
                      </div>

                      <button 
                        onClick={() => { setProductoAEditar(null); setIsAddingVariant(false); setShowForm(true); }}
                        className="w-full bg-black text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                      >
                        <Plus size={16}/> Dar de Alta Nuevo Producto
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pedidos' && (
                <div className="p-6 bg-gray-50/80 border-b border-gray-100 flex flex-col xl:flex-row gap-4 justify-between items-center">
                  
                  <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 p-2 rounded-xl shadow-sm">
                      <Calendar size={16} className="text-gray-400 ml-2" />
                      <div className="flex items-center gap-2">
                        <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer" title="Fecha desde"/>
                        <span className="text-gray-300 font-bold">-</span>
                        <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer" title="Fecha hasta"/>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-gray-200 p-2 rounded-xl shadow-sm">
                      <Filter size={16} className="text-gray-400 ml-2" />
                      <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer pr-2">
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="pagado">Pagados</option>
                        <option value="enviado">Enviados</option>
                        <option value="entregado">Entregados</option>
                        <option value="fallido">Fallidos</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-end min-w-[200px] w-full xl:w-auto">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                      <DollarSign size={12}/> Ingresos (Pagados)
                    </span>
                    <span className="text-2xl font-black text-green-600">{formatPrice(balanceTotalPagado)}</span>
                  </div>

                </div>
              )}

              <table className="w-full text-left border-collapse">
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
                    {pedidosFiltrados.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-400 font-medium">No se encontraron pedidos con estos filtros.</td></tr>
                    ) : (
                      pedidosFiltrados.map(pedido => (
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
                      ))
                    )}
                  </tbody>
                </>
              )}

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
                    {data.map(usuario => {
                      const initial = (usuario.nombre || usuario.email || '?').charAt(0).toUpperCase();
                      const displayName = (usuario.nombre && usuario.nombre.length > 0) ? usuario.nombre : 'Sin nombre';
                      
                      return (
                        <tr key={usuario.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-5 font-bold text-black flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black uppercase text-gray-500">
                              {initial}
                            </div>
                            {displayName}
                          </td>
                          <td className="p-5 text-gray-600">{usuario.email}</td>
                          <td className="p-5 text-gray-500">{usuario.telefono}</td>
                          <td className="p-5">
                            {usuario.direcciones_guardadas && usuario.direcciones_guardadas.length > 0 ? (
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
                      );
                    })}
                  </tbody>
                </>
              )}

              {activeTab === 'productos' && (
                <>
                  <thead className="bg-gray-50/80 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="p-5">Producto</th>
                      <th className="p-5">Categoría</th>
                      <th className="p-5">Inventario</th>
                      <th className="p-5 text-center">Estado</th>
                      <th className="p-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {data.map(prod => (
                      <tr key={prod.id} className={`transition-colors ${!prod.activo ? 'bg-gray-50/80 opacity-70' : 'hover:bg-gray-50/50'}`}>
                        <td className="p-5 font-bold text-black flex items-center gap-4">
                          <img src={prod.image || 'https://placehold.co/40x40/eeeeee/999999?text=Foto'} alt={prod.nombre} className={`w-10 h-10 rounded-lg object-cover bg-gray-100 ${!prod.activo && 'grayscale'}`} />
                          {prod.nombre}
                        </td>
                        <td className="p-5 text-gray-500">{prod.categoria?.nombre || 'General'}</td>
                        <td className="p-5 text-gray-500 text-xs">
                          {Number(prod.precio_final) < Number(prod.precio_base) ? (
                            <>
                              <span className="block font-bold text-gray-400 text-xs line-through mb-0.5">{formatPrice(prod.precio_base)}</span>
                              <span className="block font-black text-green-600 text-sm mb-1">{formatPrice(prod.precio_final)}</span>
                            </>
                          ) : (
                            <span className="block font-bold text-black text-sm mb-1">{formatPrice(prod.precio_base)}</span>
                          )}
                          Stock Total: {prod.variantes?.reduce((acc, curr) => acc + curr.stock, 0) || prod.stock} u.
                        </td>
                        <td className="p-5 text-center">
                          {prod.activo ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">Visible</span>
                          ) : (
                            <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-300">Oculto</span>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <button 
                            onClick={() => handleToggleVisibilidad(prod.id)} 
                            className="text-gray-500 hover:bg-gray-200 p-1.5 rounded-lg transition-colors mr-2"
                            title={prod.activo ? "Ocultar de la tienda" : "Mostrar en la tienda"}
                          >
                            {prod.activo ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                          <button 
                            onClick={() => { setProductoAEditar(prod); setIsAddingVariant(true); setShowForm(true); }} 
                            className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors mr-2"
                            title="Añadir Nueva Variante"
                          >
                            <Plus size={16}/>
                          </button>
                          <button 
                            onClick={() => { setProductoAEditar(prod); setIsAddingVariant(false); setShowForm(true); }} 
                            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors mr-2"
                            title="Editar Producto"
                          >
                            <Edit3 size={16}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(prod.id, 'producto')} 
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            title="Eliminar Producto"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

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
                          <button 
                            onClick={() => { setCategoriaAEditar(cat); setShowForm(true); }}
                            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors mr-2">
                            <Edit3 size={16}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id, 'categoría')}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
              </table>
            </div>
          )}
          
          {showForm && (activeTab === 'productos' || activeTab === 'compras') && (
            <ProductForm 
              onClose={() => setShowForm(false)} 
              refreshData={() => fetchData(activeTab)}
              productoAEditar={productoAEditar}
              isAddingVariant={isAddingVariant}
            />
          )}

          {showForm && activeTab === 'categorias' && (
            <CategoryForm 
              onClose={() => setShowForm(false)} 
              refreshData={() => fetchData('categorias')} 
              categoriaAEditar={categoriaAEditar}
            />
          )}
          
        </div>
      </div>
    </div>
  );
}