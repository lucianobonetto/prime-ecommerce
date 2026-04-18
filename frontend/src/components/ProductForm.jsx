import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductForm({ onClose, refreshData, productoAEditar = null, isAddingVariant = false }) {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  
  // ESTADO NUEVO: Variante seleccionada para editar
  const [selectedVariantId, setSelectedVariantId] = useState('');

  const [formData, setFormData] = useState({
    nombre: productoAEditar ? productoAEditar.nombre : '',
    descripcion: productoAEditar ? productoAEditar.descripcion : '',
    categoria: productoAEditar && productoAEditar.categoria ? productoAEditar.categoria.id : '',
    precio_base: '', 
    precio_final: '', 
    stock: '',
    sku: '',
    talle: '',
    color: ''
  });
  
  const [image, setImage] = useState(null);
  const [varImages, setVarImages] = useState({ img1: null, img2: null, img3: null, img4: null });
  const [clearedImages, setClearedImages] = useState({ main: false, img1: false, img2: false, img3: false, img4: false });

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

  // Carga inicial de datos de la primera variante al abrir (o dejar vacío si se agrega una)
  useEffect(() => {
    if (productoAEditar && !isAddingVariant && productoAEditar.variantes && productoAEditar.variantes.length > 0) {
      const firstVar = productoAEditar.variantes[0];
      setSelectedVariantId(firstVar.id);
      
      setFormData(prev => ({
        ...prev,
        precio_base: firstVar.precio_base,
        precio_final: Number(firstVar.precio_final) < Number(firstVar.precio_base) ? firstVar.precio_final : '',
        stock: firstVar.stock,
        sku: firstVar.sku,
        talle: firstVar.talle,
        color: firstVar.color
      }));
    }
  }, [productoAEditar, isAddingVariant]);

  // Lógica para cuando el administrador cambia la variante en el selector
  const handleVariantChange = (e) => {
    const vId = e.target.value;
    setSelectedVariantId(vId);
    
    const activeVar = productoAEditar.variantes.find(v => v.id === Number(vId));
    if (activeVar) {
      setFormData(prev => ({
        ...prev,
        precio_base: activeVar.precio_base,
        precio_final: Number(activeVar.precio_final) < Number(activeVar.precio_base) ? activeVar.precio_final : '',
        stock: activeVar.stock,
        sku: activeVar.sku,
        talle: activeVar.talle,
        color: activeVar.color
      }));
      // Limpiamos los archivos subidos temporalmente de la variante anterior
      setVarImages({ img1: null, img2: null, img3: null, img4: null });
      setClearedImages(prev => ({ ...prev, img1: false, img2: false, img3: false, img4: false }));
    }
  };

  const handleRemoveMainImage = (e) => {
    e.preventDefault();
    setImage(null);
    setClearedImages(prev => ({ ...prev, main: true }));
  };

  const handleRemoveVarImage = (e, num) => {
    e.preventDefault();
    setVarImages(prev => ({ ...prev, [`img${num}`]: null }));
    setClearedImages(prev => ({ ...prev, [`img${num}`]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    const data = new FormData();
    if (!isAddingVariant) {
        data.append('nombre', formData.nombre);
        data.append('descripcion', formData.descripcion);
        data.append('categoria', formData.categoria);
        if (image) data.append('image', image);
        if (clearedImages.main) data.append('clear_image', 'true');
        
        // MANDAMOS LA VARIANTE SELECCIONADA AL BACKEND
        if (selectedVariantId) data.append('variante_id', selectedVariantId);
    }
    
    data.append('precio_base', formData.precio_base);
    data.append('precio_final', formData.precio_final || formData.precio_base); 
    data.append('stock', formData.stock);
    data.append('sku', formData.sku);
    data.append('talle', formData.talle);
    data.append('color', formData.color);
    
    if (varImages.img1) data.append('imagen1', varImages.img1);
    if (varImages.img2) data.append('imagen2', varImages.img2);
    if (varImages.img3) data.append('imagen3', varImages.img3);
    if (varImages.img4) data.append('imagen4', varImages.img4);

    if (!isAddingVariant) {
        if (clearedImages.img1) data.append('clear_imagen1', 'true');
        if (clearedImages.img2) data.append('clear_imagen2', 'true');
        if (clearedImages.img3) data.append('clear_imagen3', 'true');
        if (clearedImages.img4) data.append('clear_imagen4', 'true');
    }

    try {
        let res;
        if (isAddingVariant && productoAEditar) {
            res = await fetch(`http://127.0.0.1:8000/api/admin/productos/${productoAEditar.id}/variantes/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
        } else if (productoAEditar) {
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
        toast.success(isAddingVariant ? 'Variante añadida con éxito' : productoAEditar ? 'Producto actualizado' : 'Producto creado con éxito');
        refreshData();
        onClose();
      } else {
        const err = await res.json();
        toast.error('Error: ' + (err.error || 'Revisá los datos ingresados'));
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Buscamos la variante activa para mostrar las imágenes correctas en la interfaz
  const activeVar = (!isAddingVariant && productoAEditar && selectedVariantId) 
    ? productoAEditar.variantes.find(v => v.id === Number(selectedVariantId))
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <h2 className="font-black uppercase tracking-widest text-sm text-black">
            {isAddingVariant ? `Añadir variante a: ${productoAEditar.nombre}` : productoAEditar ? 'Editar Producto y Variante Principal' : 'Nuevo Producto y Variante'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {!isAddingVariant && (
            <div>
              <h3 className="text-xs font-bold text-gray-800 border-b pb-2 mb-4">Datos Generales (Aplica a todas las variantes)</h3>
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
                  <textarea className="w-full bg-gray-50 border rounded-xl p-3 text-sm outline-none focus:border-black resize-none h-20" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Imagen Principal del Producto</label>
                  {image || (productoAEditar?.image && !clearedImages.main) ? (
                    <div className="relative w-40 h-40 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={image ? URL.createObjectURL(image) : productoAEditar.image} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={handleRemoveMainImage} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"><Trash2 size={16} /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 w-full bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-sm font-bold cursor-pointer hover:bg-gray-100 hover:border-black transition-colors text-gray-500">
                      <Upload size={24} className="text-gray-400"/><span>Subir Imagen Principal</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-800 border-b pb-2 mb-4">
                {isAddingVariant ? 'Detalles de la Nueva Variante' : 'Detalles de la Variante Seleccionada'}
            </h3>

            {/* --- EL GRAN MENÚ DESPLEGABLE AMARILLO --- */}
            {!isAddingVariant && productoAEditar && productoAEditar.variantes?.length > 1 && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                <label className="text-[10px] font-black uppercase text-yellow-800 mb-2 block">Variante a Editar</label>
                <select 
                  className="w-full bg-white border border-yellow-300 rounded-xl p-3 text-sm font-bold outline-none focus:border-yellow-500 text-gray-700 cursor-pointer"
                  value={selectedVariantId}
                  onChange={handleVariantChange}
                >
                  {productoAEditar.variantes.map(v => (
                    <option key={v.id} value={v.id}>Talle: {v.talle} / Color: {v.color} (Stock: {v.stock})</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Precio Normal ($) *</label>
                <input type="number" required className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black" value={formData.precio_base} onChange={(e) => setFormData({...formData, precio_base: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-[#009EE3] mb-2 block">Precio Oferta ($) (Opcional)</label>
                <input type="number" placeholder="Dejar vacío si no hay promo" className="w-full bg-blue-50 border border-blue-100 text-blue-900 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#009EE3]" value={formData.precio_final} onChange={(e) => setFormData({...formData, precio_final: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Stock *</label>
                <input type="number" required min="0" className="w-full bg-white border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">SKU (Código único)</label>
                <input placeholder="Auto-generado si vacío" className="w-full bg-white border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Talle *</label>
                <input required placeholder="Ej: M, 42, Único" className="w-full bg-white border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.talle} onChange={(e) => setFormData({...formData, talle: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Color *</label>
                <input required placeholder="Ej: Rojo, Negro, Único" className="w-full bg-white border rounded-xl p-3 text-sm outline-none focus:border-black" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
              </div>
            </div>

            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 block">Imágenes Exclusivas de esta variante (Máx. 4)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(num => {
                const newFile = varImages[`img${num}`];
                // Acoplamos la imagen a mostrar con la variante elegida
                const existingFile = activeVar ? activeVar[`imagen${num}`] : null;
                const isCleared = clearedImages[`img${num}`];
                
                const hasImageToShow = newFile || (existingFile && !isCleared);

                return (
                  <div key={num} className="relative w-full aspect-square bg-white border border-dashed border-gray-300 rounded-xl overflow-hidden group">
                    {hasImageToShow ? (
                      <>
                        <img src={newFile ? URL.createObjectURL(newFile) : existingFile} alt={`Variante ${num}`} className="w-full h-full object-cover" />
                        <button onClick={(e) => handleRemoveVarImage(e, num)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"><X size={14} /></button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-full gap-1 cursor-pointer hover:bg-gray-50 transition-colors text-gray-400">
                        <ImageIcon size={20} />
                        <span className="text-xs font-bold text-center px-2">Subir Foto {num}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setVarImages({...varImages, [`img${num}`]: e.target.files[0]})} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button disabled={loading} className="w-full mt-4 bg-[#009EE3] text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-[#008ACB] active:scale-95 transition-all shadow-md">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={18}/> {isAddingVariant ? 'Guardar Nueva Variante' : productoAEditar ? 'Guardar Cambios' : 'Publicar Producto'}</>}
          </button>
        </form>
      </div>
    </div>
  );
}