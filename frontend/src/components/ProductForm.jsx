import React, { useState } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductForm({ onClose, refreshData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio_base: '',
  });
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    // Usamos FormData porque hay una imagen (archivo)
    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('descripcion', formData.descripcion);
    data.append('precio_base', formData.precio_base);
    if (image) data.append('image', image);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/productos/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      if (res.ok) {
        toast.success('Producto creado con éxito');
        refreshData('productos');
        onClose();
      } else {
        toast.error('Error al crear el producto');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-black uppercase tracking-widest text-sm">Nuevo Producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Nombre del Producto</label>
            <input 
              required
              className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Precio Base</label>
              <input 
                type="number" required
                className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black"
                value={formData.precio_base}
                onChange={(e) => setFormData({...formData, precio_base: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Imagen</label>
              <label className="flex items-center justify-center gap-2 w-full bg-gray-50 border border-dashed rounded-xl p-3 text-xs font-bold cursor-pointer hover:bg-gray-100">
                <Upload size={14}/> {image ? 'Cambiar' : 'Subir Foto'}
                <input type="file" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
              </label>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-black text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
          >
            {loading ? 'Guardando...' : <><Save size={16}/> Guardar Producto</>}
          </button>
        </form>
      </div>
    </div>
  );
}