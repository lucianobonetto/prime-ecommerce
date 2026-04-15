import React, { useState, useEffect } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductForm({ onClose, refreshData, productoAEditar = null }) {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: productoAEditar ? productoAEditar.nombre : '',
    descripcion: productoAEditar ? productoAEditar.descripcion : '',
    categoria: productoAEditar && productoAEditar.categoria ? productoAEditar.categoria.id : '',
    precio_base: productoAEditar ? productoAEditar.precio_base : '', 
    stock: productoAEditar ? productoAEditar.stock : '',
    sku: productoAEditar ? productoAEditar.sku : '',
    talle: productoAEditar ? productoAEditar.talle : 'Único',
    color: productoAEditar ? productoAEditar.color : 'Único'
  });
  
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categorias/')
      .then(res => res.json())
      .then(data => {
        setCategorias(data);
        if(data.length > 0 && !productoAEditar && !formData.categoria) {
            setFormData(prev => ({...prev, categoria: data[0].id}));
        }
      });
  }, [productoAEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('descripcion', formData.descripcion);
    data.append('categoria', formData.categoria);
    data.append('precio_base', formData.precio_base);
    data.append('stock', formData.stock);
    data.append('sku', formData.sku);
    data.append('talle', formData.talle);
    data.append('color', formData.color);
    if (image) data.append('image', image);

    try {
        let res;
        if (productoAEditar) {
            res = await fetch(`http://127.0.0.1:8000/api/admin/editar-producto/${productoAEditar.id}/`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
        } else {
            res = await fetch('http://127.0.0.1:8000/api/admin/crear-producto/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data 
            });
        }

      if (res.ok) {
        toast.success(productoAEditar ? 'Producto actualizado' : 'Producto creado con éxito');
        refreshData();
        onClose();
      } else {
        const err = await res.json();
        toast.error('Error: ' + (err.error || 'No se pudo procesar'));
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <h2 className="font-black uppercase tracking-widest text-sm text-black">
            {productoAEditar ? 'Editar Producto y Stock' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-800 border-b pb-2 mb-4">Datos del Catálogo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Nombre *</label>
                <input required className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Categoría *</label>
                <select required className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})}>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Descripción</label>
                <textarea className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black resize-none h-24" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Imagen Principal {productoAEditar && '(Dejar vacío para mantener actual)'}</label>
                <label className="flex items-center justify-center gap-2 w-full bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-sm font-bold cursor-pointer hover:bg-gray-100 transition-colors">
                  <Upload size={18} className="text-blue-500"/> {image ? image.name : 'Seleccionar Archivo (JPG, PNG)'}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-800 border-b pb-2 mb-4 mt-6">Inventario y Variantes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Precio ($) *</label>
                <input type="number" required className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.precio_base} onChange={(e) => setFormData({...formData, precio_base: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Stock *</label>
                <input type="number" required min="0" className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Talle</label>
                <input className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.talle} onChange={(e) => setFormData({...formData, talle: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Color</label>
                <input className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">SKU (Código único)</label>
                <input placeholder="Auto-generado si vacío" className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
              </div>
            </div>
          </div>

          <button disabled={loading} className="w-full mt-8 bg-[#009EE3] text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-[#008ACB] active:scale-95 transition-all shadow-md">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={18}/> {productoAEditar ? 'Guardar Cambios' : 'Publicar Producto'}</>}
          </button>
        </form>
      </div>
    </div>
  );
}