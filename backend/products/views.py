import mercadopago
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category, Product, Order, OrderItem
from .serializers import CategorySerializer, ProductSerializer

# --- VISTAS DEL CATÁLOGO (Lo que ya tenías) ---
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

@api_view(['POST'])
def create_preference(request):
    try:
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        cart_items = request.data.get('items', [])
        
        # 1. Calculamos el total recorriendo el carrito
        total_price = sum(float(item['unit_price']) * int(item['quantity']) for item in cart_items)
        
        # 2. Creamos la orden en la base de datos en estado "pending"
        order = Order.objects.create(
            total=total_price,
            status='pending'
        )

        items_for_mp = []
        for item in cart_items:
            # 3. Anotamos cada reloj en la base de datos (OrderItem)
            try:
                # Buscamos el producto real en la base de datos usando el ID que manda React
                product = Product.objects.get(id=item.get('id'))
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=int(item['quantity']),
                    price=float(item['unit_price'])
                )
            except Product.DoesNotExist:
                print(f"Ojo: No se encontró el producto con ID {item.get('id')}")

            # Preparamos el formato que exige Mercado Pago
            items_for_mp.append({
                "title": item['title'],
                "quantity": int(item['quantity']),
                "unit_price": float(item['unit_price']),
                "currency_id": "ARS"
            })

        # 4. Le mandamos los datos a Mercado Pago
        preference_data = {
            "items": items_for_mp,
            # Le pasamos el ID de nuestra orden para que MP nos lo devuelva después
            "external_reference": str(order.id), 
        }

        preference_response = sdk.preference().create(preference_data)
        preference = preference_response.get("response", {})

        if 'init_point' in preference:
            return Response({'init_point': preference['init_point']}, status=status.HTTP_200_OK)
        else:
            return Response({'error': str(preference)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)