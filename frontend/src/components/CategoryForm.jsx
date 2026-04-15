import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoryForm({ onClose, refreshData, categoriaAEditar = null }) {
  // Si nos pasan categoría, ponemos su nombre. Si no, vacío.
  const [nombre, setNombre] = useState(categoriaAEditar ? categoriaAEditar.nombre : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
        let url = 'http://127.0.0.1:8000/api/categorias/';
        let method = 'POST';

        // Si estamos editando, cambiamos la URL y el método
        if (categoriaAEditar) {
            url = `http://127.0.0.1:8000/api/categorias/${categoriaAEditar.id}/`;
            method = 'PUT';
        }

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ nombre })
      });

      if (res.ok) {
        toast.success(categoriaAEditar ? 'Categoría actualizada' : 'Categoría creada exitosamente');
        refreshData('categorias');
        onClose();
      } else {
        toast.error('Error al guardar la categoría');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-black uppercase tracking-widest text-sm">
              {categoriaAEditar ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Nombre</label>
            <input 
              required
              placeholder="Ej: Calzado, Remeras..."
              className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <button disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
            {loading ? 'Guardando...' : <><Save size={16}/> Guardar</>}
          </button>
        </form>
      </div>
    </div>
  );
}