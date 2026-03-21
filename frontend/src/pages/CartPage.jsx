import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // NUEVO IMPORT
import { X, Minus, Plus, Truck, Store, Tag, MapPin, BookUser } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // NUEVO useNavigate

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();
  const { isAuthenticated } = useAuth(); // NUEVO: Saber si está logueado
  const navigate = useNavigate(); // NUEVO: Para redirigirlo al login
  const [deliveryMethod, setDeliveryMethod] = useState('sucursal');
  const [isLoading, setIsLoading] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new'); 

  const [shippingDetails, setShippingDetails] = useState({
    ciudad: 'Godoy Cruz',
    codigoPostal: '',
    calle: '',
    numero: '',
    descripcion: '',
    telefono: ''
  });

  const shippingCost = deliveryMethod === 'domicilio' ? 5000 : 0;
  const finalTotal = cartTotal + shippingCost;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://127.0.0.1:8000/api/mis-direcciones/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data.length > 0) {
          setSavedAddresses(data);
          setSelectedAddressId(data[0].id);
        }
      })
      .catch(err => console.log("Modo invitado: No se cargaron direcciones previas."));
    }
  }, []);

  const getActiveShippingDetails = () => {
    if (selectedAddressId === 'new') return shippingDetails;
    const addr = savedAddresses.find(a => a.id.toString() === selectedAddressId.toString());
    return addr ? {
      ciudad: addr.ciudad, codigoPostal: addr.codigoPostal,
      calle: addr.calle, numero: addr.numero,
      descripcion: addr.descripcion || '', telefono: addr.telefono
    } : shippingDetails;
  };

  const isShippingValid = () => {
    if (deliveryMethod === 'sucursal') return true;
    if (selectedAddressId !== 'new') return true;
    return (
      shippingDetails.ciudad.trim() !== '' &&
      shippingDetails.codigoPostal.trim() !== '' &&
      shippingDetails.calle.trim() !== '' &&
      shippingDetails.numero.trim() !== '' &&
      shippingDetails.telefono.trim() !== ''
    );
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const items = cart.map(item => ({
        id: item.variante.id,
        title: `${item.producto.nombre} - ${item.variante.color} ${item.variante.talle}`,
        quantity: item.cantidad,
        unit_price: item.variante.precio_base
      }));

      if (shippingCost > 0) {
        items.push({ id: "ENVIO-01", title: "Envío a domicilio", quantity: 1, unit_price: shippingCost });
      }

      const activeDetails = getActiveShippingDetails();

      const payload = {
        items: items,
        delivery_method: deliveryMethod,
        shipping_details: deliveryMethod === 'domicilio' ? activeDetails : null
      };

      const response = await fetch('http://127.0.0.1:8000/api/create_preference/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('Error al generar el pago: ' + (data.error || 'Desconocido'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor de pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6">
          <Truck size={40} />
        </div>
        <h2 className="text-3xl font-black mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8 max-w-md">Parece que aún no has agregado productos a tu carrito. ¡Explora nuestro catálogo y encuentra lo que buscas!</p>
        <Link to="/productos" className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6 min-h-screen">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
          Carrito de productos
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* COLUMNA IZQUIERDA */}
        <div className="flex-1 space-y-8">
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 py-4 px-6 font-bold text-gray-500 text-xs uppercase tracking-widest border-b border-gray-200">
              <div className="col-span-5">Producto</div>
              <div className="col-span-3 text-center">Precio unitario</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <div className="divide-y divide-gray-100">
              {cart.map((item) => {
                const precio = item.variante.precio_final || item.variante.precio_base;
                return (
                  <div key={item.variante.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 px-6">
                    <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                      <button onClick={() => removeFromCart(item.variante.id)} className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"><X size={16} /></button>
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img src={item.producto.image || 'https://via.placeholder.com/80'} alt={item.producto.nombre} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-bold leading-tight mb-1 text-black">{item.producto.nombre}</h3>
                        <p className="text-xs text-gray-500 mb-2">{item.variante.talle} / {item.variante.color}</p>
                        <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full w-fit">Stock: {item.variante.stock_disponible}</span>
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-3 text-center md:text-center font-bold text-gray-900 text-lg mt-4 md:mt-0"><span className="md:hidden text-sm font-normal text-gray-500 mr-2">Precio:</span>{formatPrice(precio)}</div>
                    <div className="col-span-1 md:col-span-2 flex justify-center mt-2 md:mt-0">
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                        <button onClick={() => updateQuantity(item.variante.id, item.cantidad - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-md transition-colors"><Minus size={14}/></button>
                        <span className="w-8 text-center font-bold text-sm">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.variante.id, item.cantidad + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-md transition-colors"><Plus size={14}/></button>
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 text-right font-black text-black text-lg mt-2 md:mt-0"><span className="md:hidden text-sm font-normal text-gray-500 mr-2">Subtotal:</span>{formatPrice(precio * item.cantidad)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-black mb-4">Método de entrega</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100 transition-all">
              
              <label className={`flex items-center justify-between p-6 cursor-pointer transition-colors ${deliveryMethod === 'sucursal' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <input type="radio" name="delivery" checked={deliveryMethod === 'sucursal'} onChange={() => setDeliveryMethod('sucursal')} className="w-5 h-5 text-black border-gray-300 focus:ring-black cursor-pointer" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deliveryMethod === 'sucursal' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}><Store size={20}/></div>
                  <div>
                    <h4 className={`font-bold ${deliveryMethod === 'sucursal' ? 'text-black' : 'text-gray-700'}`}>Retiro en sucursal</h4>
                    <p className="text-xs text-gray-500">Gratis. Godoy Cruz, Mendoza.</p>
                  </div>
                </div>
                <span className="font-bold text-black">Gratis</span>
              </label>

              <div className={`${deliveryMethod === 'domicilio' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                <label className="flex items-center justify-between p-6 cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <input type="radio" name="delivery" checked={deliveryMethod === 'domicilio'} onChange={() => setDeliveryMethod('domicilio')} className="w-5 h-5 text-black border-gray-300 focus:ring-black cursor-pointer" />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deliveryMethod === 'domicilio' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}><Truck size={20}/></div>
                    <div>
                      <h4 className={`font-bold ${deliveryMethod === 'domicilio' ? 'text-black' : 'text-gray-700'}`}>Envío a domicilio</h4>
                      <p className="text-xs text-gray-500">Llega entre 2 y 4 días hábiles.</p>
                    </div>
                  </div>
                  <span className="font-bold text-black">{formatPrice(5000)}</span>
                </label>

                {deliveryMethod === 'domicilio' && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-200 mt-2">
                    
                    {savedAddresses.length > 0 && (
                      <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                          <BookUser size={16} /> Mis Direcciones
                        </h4>
                        <select 
                          value={selectedAddressId} 
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-medium focus:ring-black focus:border-black"
                        >
                          {savedAddresses.map(addr => (
                            <option key={addr.id} value={addr.id}>
                              {addr.calle} {addr.numero}, {addr.ciudad}
                            </option>
                          ))}
                          <option value="new">+ Ingresar una nueva dirección</option>
                        </select>
                      </div>
                    )}

                    {selectedAddressId === 'new' && (
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                          <MapPin size={16} /> Detalles del domicilio
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Calle / Avenida *</label>
                            <input type="text" value={shippingDetails.calle} onChange={e => setShippingDetails({...shippingDetails, calle: e.target.value})} placeholder="Ej: San Martín" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Número *</label>
                            <input type="text" value={shippingDetails.numero} onChange={e => setShippingDetails({...shippingDetails, numero: e.target.value})} placeholder="Ej: 1234" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Código Postal *</label>
                            <input type="text" value={shippingDetails.codigoPostal} onChange={e => setShippingDetails({...shippingDetails, codigoPostal: e.target.value})} placeholder="Ej: 5501" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Ciudad *</label>
                            <input type="text" value={shippingDetails.ciudad} onChange={e => setShippingDetails({...shippingDetails, ciudad: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Teléfono de contacto *</label>
                            <input type="tel" value={shippingDetails.telefono} onChange={e => setShippingDetails({...shippingDetails, telefono: e.target.value})} placeholder="Ej: 261 123 4567" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Descripción / Referencia (Opcional)</label>
                            <input type="text" value={shippingDetails.descripcion} onChange={e => setShippingDetails({...shippingDetails, descripcion: e.target.value})} placeholder="Ej: Casa portón negro, timbre 2" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:border-black focus:ring-black" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <aside className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm sticky top-28">
            <h3 className="text-lg font-black text-black mb-6">Resumen de compra</h3>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Productos ({cartCount})</span>
                <span className="font-bold text-black">{formatPrice(cartTotal)}</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-200">
                {cart.map(item => (
                  <div key={item.variante.id} className="flex justify-between text-xs text-gray-500">
                    <span className="truncate pr-4">{item.cantidad}x {item.producto.nombre}</span>
                    <span className="whitespace-nowrap font-medium text-gray-900">{formatPrice((item.variante.precio_final || item.variante.precio_base) * item.cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-gray-600 border-b border-gray-200 pb-4">
                <span>Envío {deliveryMethod === 'domicilio' ? 'a domicilio' : 'a sucursal'}</span>
                <span className="font-bold text-black">{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-black text-black">Total</span>
              <span className="text-3xl font-black text-black">{formatPrice(finalTotal)}</span>
            </div>

            <button className="flex items-center gap-2 text-gray-500 text-sm font-bold hover:text-black transition-colors mb-8">
              <Tag size={16} /> Agregar cupón de descuento
            </button>

            {/* NUEVO: Lógica del Botón de Pago vs Iniciar Sesión */}
            {isAuthenticated ? (
              <button 
                onClick={handlePayment}
                disabled={isLoading || !isShippingValid()}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-md flex justify-center items-center gap-2 ${
                  isLoading || !isShippingValid() 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#009EE3] text-white hover:bg-[#008ACB] active:scale-95'
                }`}
              >
                {isLoading ? 'Cargando...' : !isShippingValid() ? 'Completá tu dirección' : 'Pagar con Mercado Pago'}
              </button>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-md flex justify-center items-center gap-2 bg-black text-white hover:bg-gray-800 active:scale-95"
              >
                Iniciar sesión para pagar
              </button>
            )}

            <p className="text-center text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">
              Pago 100% seguro y encriptado
            </p>
         </div>
          </aside>
        </div>

        {/* NUEVO: VENTANITA EMERGENTE (MODAL) DE CARGA */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-pulse">
              <div className="w-16 h-16 border-4 border-[#009EE3] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-2xl font-black text-black mb-2 tracking-tight">Preparando tu pago</h3>
              <p className="text-gray-500 font-medium text-sm">
                Serás redirigido a Mercado Pago de forma segura en unos segundos...
              </p>
            </div>
          </div>
        )}

      </div>
    );
}