import mercadopago
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission, SAFE_METHODS # NUEVOS IMPORT
from rest_framework.response import Response
import re
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.db.models import F
from django.shortcuts import redirect

from .models import Categoria, Producto, Variante, Pedido, ItemPedido, PerfilUsuario, Direccion, Resena
from .serializers import CategorySerializer, ProductSerializer, ResenaSerializer

# --- NUEVO: Permiso personalizado para el Catálogo ---
class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        # Si es un método seguro (GET, HEAD, OPTIONS), dejamos pasar a cualquiera
        if request.method in SAFE_METHODS:
            return True
        # Si es POST, PUT, DELETE, solo dejamos pasar si es staff (Admin)
        return bool(request.user and request.user.is_staff)

# --- VISTAS DEL CATÁLOGO (ACTUALIZADAS PARA ABM) ---
# Cambiamos ReadOnlyModelViewSet a ModelViewSet y aplicamos el permiso
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all() 
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

# --- VISTAS DE PERFIL Y DIRECCIONES ---
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def mi_perfil(request):
    user = request.user
    perfil, created = PerfilUsuario.objects.get_or_create(usuario=user)

    if request.method == 'GET':
        data = {
            "nombre": user.first_name,
            "apellido": user.last_name,
            "email": user.email,
            "telefono": perfil.telefono,
            "is_admin": user.is_staff # NUEVO: Le avisamos a React si es administrador
        }
        return Response(data)

    elif request.method == 'PUT':
        user.first_name = request.data.get('nombre', user.first_name)
        user.last_name = request.data.get('apellido', user.last_name)
        user.email = request.data.get('email', user.email)
        user.save()

        perfil.telefono = request.data.get('telefono', perfil.telefono)
        perfil.save()
        return Response({"mensaje": "Perfil actualizado exitosamente."})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def mis_direcciones(request):
    if request.method == 'GET':
        direcciones = Direccion.objects.filter(usuario=request.user).order_by('-id')
        data = [{
            "id": d.id, "calle": d.calle, "numero": d.numero,
            "codigoPostal": d.codigo_postal, "ciudad": d.ciudad,
            "telefono": d.telefono, "descripcion": d.descripcion
        } for d in direcciones]
        return Response(data)
    
    elif request.method == 'POST':
        direccion = Direccion.objects.create(
            usuario=request.user,
            calle=request.data.get('calle'),
            numero=request.data.get('numero'),
            codigo_postal=request.data.get('codigoPostal'),
            ciudad=request.data.get('ciudad'),
            telefono=request.data.get('telefono'),
            descripcion=request.data.get('descripcion')
        )
        return Response({"id": direccion.id, "mensaje": "Dirección guardada"}, status=status.HTTP_201_CREATED)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def direccion_detalle(request, pk):
    try:
        direccion = Direccion.objects.get(id=pk, usuario=request.user)
    except Direccion.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        direccion.calle = request.data.get('calle', direccion.calle)
        direccion.numero = request.data.get('numero', direccion.numero)
        direccion.codigo_postal = request.data.get('codigoPostal', direccion.codigo_postal)
        direccion.ciudad = request.data.get('ciudad', direccion.ciudad)
        direccion.telefono = request.data.get('telefono', direccion.telefono)
        direccion.descripcion = request.data.get('descripcion', direccion.descripcion)
        direccion.save()
        return Response({"mensaje": "Dirección actualizada"})

    elif request.method == 'DELETE':
        direccion.delete()
        return Response({"mensaje": "Dirección eliminada"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_pedidos(request):
    pedidos = Pedido.objects.filter(usuario=request.user).order_by('-fecha')
    data = []
    for pedido in pedidos:
        items = ItemPedido.objects.filter(pedido=pedido)
        resumen = ", ".join([f"{item.variante.producto.nombre} ({item.variante.talle}) x{item.cantidad}" for item in items])
        data.append({
            "id": pedido.id,
            "fecha": pedido.fecha,
            "total_final": pedido.total_final,
            "estado": pedido.estado,
            "items_resumen": resumen if resumen else "Sin items detallados",
            "metodo_envio": pedido.metodo_envio
        })
    return Response(data)


# =========================================================
# --- VISTAS EXCLUSIVAS DEL PANEL DE ADMINISTRACIÓN ---
# =========================================================

@api_view(['GET'])
@permission_classes([IsAdminUser]) # Solo staff puede ver esto
def admin_pedidos(request):
    pedidos = Pedido.objects.all().order_by('-fecha')
    data = []
    for pedido in pedidos:
        items = ItemPedido.objects.filter(pedido=pedido)
        resumen = ", ".join([f"{item.variante.producto.nombre} ({item.variante.talle}) x{item.cantidad}" for item in items])
        
        # Armamos la dirección de forma segura
        direccion_envio = "Retiro en sucursal"
        if pedido.metodo_envio == 'domicilio' and pedido.envio_calle:
            direccion_envio = f"{pedido.envio_calle} {pedido.envio_numero}, {pedido.envio_ciudad}"

        data.append({
            "id": pedido.id,
            "usuario": pedido.usuario.email if pedido.usuario else "Invitado",
            "fecha": pedido.fecha,
            "total_final": pedido.total_final,
            "estado": pedido.estado,
            "metodo_envio": pedido.metodo_envio,
            "direccion": direccion_envio,
            "items_resumen": resumen,
        })
    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_actualizar_pedido(request, pk):
    try:
        pedido = Pedido.objects.get(id=pk)
        nuevo_estado = request.data.get('estado')
        if nuevo_estado in dict(Pedido.ESTADO_CHOICES).keys():
            pedido.estado = nuevo_estado
            pedido.save()
            return Response({"mensaje": f"Pedido #{pedido.id} actualizado a '{nuevo_estado}'."})
        return Response({"error": "Estado no válido."}, status=status.HTTP_400_BAD_REQUEST)
    except Pedido.DoesNotExist:
        return Response({"error": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_usuarios(request):
    usuarios = User.objects.all().order_by('-date_joined')
    data = []
    for u in usuarios:
        perfil = PerfilUsuario.objects.filter(usuario=u).first()
        direcciones = Direccion.objects.filter(usuario=u)
        dirs_list = [f"{d.calle} {d.numero}, {d.ciudad} (CP: {d.codigo_postal})" for d in direcciones]
        
        data.append({
            "id": u.id,
            "email": u.email,
            "nombre": f"{u.first_name} {u.last_name}".strip(),
            "telefono": perfil.telefono if perfil else "Sin registrar",
            "is_admin": u.is_staff,
            "direcciones_guardadas": dirs_list
        })
    return Response(data)


# =========================================================
# --- VISTAS DE PAGO (MANTENIDAS EXACTAMENTE IGUAL) ---
# =========================================================
@api_view(['POST'])
def create_preference(request):
    try:
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        cart_items = request.data.get('items', [])
        delivery_method = request.data.get('delivery_method', 'sucursal')
        shipping_details = request.data.get('shipping_details', {})
        
        total_price_seguro = 0
        items_for_mp = []
        
        for item in cart_items:
            if item.get('id') == "ENVIO-01":
                total_price_seguro += float(item['unit_price'])
                items_for_mp.append(item)
                continue

            cantidad_solicitada = int(item.get('quantity', 0))
            if cantidad_solicitada <= 0:
                return Response({'error': f"La cantidad para el item {item.get('title')} debe ser mayor a 0."}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                variante = Variante.objects.get(id=item.get('id'))
                if variante.stock_disponible < cantidad_solicitada:
                    return Response({'error': f"Stock insuficiente para {item.get('title')}. Solo quedan {variante.stock_disponible} unidades."}, status=status.HTTP_400_BAD_REQUEST)
                
                precio_unitario_real = variante.precio_final
                total_price_seguro += float(precio_unitario_real) * cantidad_solicitada

                items_for_mp.append({
                    "title": f"{variante.producto.nombre} ({variante.talle}/{variante.color})",
                    "quantity": cantidad_solicitada,
                    "unit_price": float(precio_unitario_real),
                    "currency_id": "ARS"
                })

            except Variante.DoesNotExist:
                return Response({'error': f"El producto {item.get('title')} ya no existe en el catálogo."}, status=status.HTTP_400_BAD_REQUEST)

        usuario_pedido = request.user if request.user.is_authenticated else None

        pedido = Pedido.objects.create(
            usuario=usuario_pedido,
            total_final=total_price_seguro,
            estado='pendiente',
            metodo_envio=delivery_method,
            envio_calle=shipping_details.get('calle') if delivery_method == 'domicilio' else None,
            envio_numero=shipping_details.get('numero') if delivery_method == 'domicilio' else None,
            envio_ciudad=shipping_details.get('ciudad') if delivery_method == 'domicilio' else None,
            envio_codigo_postal=shipping_details.get('codigoPostal') if delivery_method == 'domicilio' else None,
            envio_telefono=shipping_details.get('telefono') if delivery_method == 'domicilio' else None,
            envio_descripcion=shipping_details.get('descripcion') if delivery_method == 'domicilio' else None,
        )

        for item in cart_items:
            if item.get('id') == "ENVIO-01":
                continue 
            variante = Variante.objects.get(id=item.get('id'))
            ItemPedido.objects.create(
                pedido=pedido,
                variante=variante,
                cantidad=int(item['quantity']),
                precio_historico=float(variante.precio_final)
            )

        preference_data = {
            "items": items_for_mp,
            "external_reference": str(pedido.id), 
           "notification_url": "https://697d9a6d93a1dd.lhr.life/api/webhook/",
        "back_urls": {
            "success": "https://697d9a6d93a1dd.lhr.life/api/mp-redirect/",
            "failure": "https://697d9a6d93a1dd.lhr.life/api/mp-redirect/",
            "pending": "https://697d9a6d93a1dd.lhr.life/api/mp-redirect/"
        },
            "auto_return": "approved",
        }

        preference_response = sdk.preference().create(preference_data)
        preference = preference_response.get("response", {})

        if 'init_point' in preference:
            return Response({'init_point': preference['init_point']}, status=status.HTTP_200_OK)
        else:
            return Response({'error': str(preference)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def mercadopago_webhook(request):
    try:
        payment_id = request.data.get('data', {}).get('id')
        
        if payment_id:
            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
            payment_info = sdk.payment().get(payment_id)
            
            if payment_info["status"] == 200:
                payment = payment_info["response"]
                order_id = payment.get("external_reference")
                status_mp = payment.get("status") 
                
                if order_id:
                    with transaction.atomic():
                        pedido = Pedido.objects.select_for_update().get(id=order_id)
                        
                        if pedido.estado == 'pendiente' and status_mp == 'approved':
                            pedido.estado = 'pagado'
                            
                            items_del_pedido = ItemPedido.objects.filter(pedido=pedido)
                            for item in items_del_pedido:
                                Variante.objects.filter(id=item.variante.id).update(
                                    stock_disponible=F('stock_disponible') - item.cantidad
                                )

                        elif status_mp in ['rejected', 'cancelled']:
                            pedido.estado = 'fallido'
                            
                        pedido.save()
                        print(f"✅ Pedido #{pedido.id} actualizado a: {pedido.estado}. Stock descontado si fue pagado.")
                    
        return Response(status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Error en webhook: {e}")
        return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def registro_usuario(request):
    data = request.data
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    password_confirm = data.get('password_confirm', '') 
    nombre = data.get('nombre', '').strip()
    apellido = data.get('apellido', '').strip()

    try:
        if not email.endswith('@gmail.com'):
            return Response({'error': 'Por motivos de seguridad y notificaciones, solo aceptamos cuentas de @gmail.com.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Este correo ya se encuentra registrado en nuestro sistema.'}, status=status.HTTP_400_BAD_REQUEST)

        if password != password_confirm:
            return Response({'error': 'Las contraseñas no coinciden. Por favor, intentalo de nuevo.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'error': 'La contraseña debe tener al menos 8 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not re.search(r'[A-Za-z]', password) or not re.search(r'[0-9]', password):
            return Response({'error': 'La contraseña debe ser alfanumérica (contener al menos una letra y un número).'}, status=status.HTTP_400_BAD_REQUEST)

        nuevo_usuario = User.objects.create(
            username=email,
            email=email,
            password=make_password(password),
            first_name=nombre,
            last_name=apellido
        )
        return Response({'mensaje': 'Cuenta creada con éxito. Ya podés iniciar sesión.'}, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': f'Error interno: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def mercadopago_redirect(request):
    return redirect('http://localhost:5173/success')

# =========================================================
# --- NUEVO: VISTAS DE RESEÑAS / COMENTARIOS ---
# =========================================================
# from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission, SAFE_METHODS

@api_view(['POST'])
@permission_classes([IsAuthenticated]) # <-- NUEVO: CANDADO DE SEGURIDAD
def crear_resena(request, producto_id):
    try:
        producto = Producto.objects.get(id=producto_id)
        
        rating = request.data.get('rating', 5)
        comentario = request.data.get('comentario', '')

        if not comentario.strip():
            return Response(
                {"error": "El comentario no puede estar vacío."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Como exigimos estar logueados, request.user siempre va a existir
        resena = Resena.objects.create(
            producto=producto,
            usuario=request.user,
            rating=int(rating),
            comentario=comentario
        )

        serializer = ResenaSerializer(resena)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Producto.DoesNotExist:
        return Response(
            {"error": "Producto no encontrado."}, 
            status=status.HTTP_404_NOT_FOUND
        )