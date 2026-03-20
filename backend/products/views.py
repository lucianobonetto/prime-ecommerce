import mercadopago
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F

# Importamos con los nombres EXACTOS de tu models.py
from .models import Categoria, Producto, Variante, Pedido, ItemPedido
from .serializers import CategorySerializer, ProductSerializer

# --- VISTAS DEL CATÁLOGO ---
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Producto.objects.all() 
    serializer_class = ProductSerializer

@api_view(['POST'])
def create_preference(request):
    try:
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        cart_items = request.data.get('items', [])
        
        # Variables seguras calculadas en el backend
        total_price_seguro = 0
        items_for_mp = []
        
        # --- NUEVO: VALIDACIÓN ESTRICTA DE STOCK Y CÁLCULO SEGURO ---
        for item in cart_items:
            cantidad_solicitada = int(item.get('quantity', 0))
            
            # Bloqueo 1: Cantidades inválidas (cero o negativas)
            if cantidad_solicitada <= 0:
                return Response(
                    {'error': f"La cantidad para el item {item.get('title')} debe ser mayor a 0."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Bloqueo 2: Verificación de stock y obtención del PRECIO REAL
            try:
                variante = Variante.objects.get(id=item.get('id'))
                
                if variante.stock_disponible < cantidad_solicitada:
                    return Response(
                        {'error': f"Stock insuficiente para {item.get('title')}. Solo quedan {variante.stock_disponible} unidades."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # CÁLCULO SEGURO: Usamos el precio final de la base de datos, ignorando el del frontend
                precio_unitario_real = variante.precio_final
                total_price_seguro += float(precio_unitario_real) * cantidad_solicitada

                # Preparamos el item para MP con los datos seguros
                items_for_mp.append({
                    "title": f"{variante.producto.nombre} ({variante.talle}/{variante.color})",
                    "quantity": cantidad_solicitada,
                    "unit_price": float(precio_unitario_real),
                    "currency_id": "ARS"
                })

            except Variante.DoesNotExist:
                return Response(
                    {'error': f"El producto {item.get('title')} ya no existe en el catálogo."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        # --- FIN DE VALIDACIÓN Y CÁLCULO ---

        # Creamos el PEDIDO con el total seguro
        pedido = Pedido.objects.create(
            total_final=total_price_seguro,
            estado='pendiente'
        )

        # Guardamos el historial de items del pedido
        for item in cart_items:
            variante = Variante.objects.get(id=item.get('id'))
            ItemPedido.objects.create(
                pedido=pedido,
                variante=variante,
                cantidad=int(item['quantity']),
                precio_historico=float(variante.precio_final) # Guardamos el precio seguro
            )

        # 4. Mercado Pago
        preference_data = {
            "items": items_for_mp,
            "external_reference": str(pedido.id), 
            "notification_url": "https://fda5bc0e621a53.lhr.life/api/products/webhook/",
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
                            
                            # DESCUENTO DE STOCK SEGURO
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