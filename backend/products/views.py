import mercadopago
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category, Product
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
        
        items_for_mp = []
        for item in cart_items:
            items_for_mp.append({
                "title": item['title'],
                "quantity": int(item['quantity']),
                "unit_price": float(item['unit_price']),
                "currency_id": "ARS"
            })

       # Le mandamos SOLO los items, sin URLs de retorno por ahora
        preference_data = {
            "items": items_for_mp,
        }

        preference_response = sdk.preference().create(preference_data)
        preference_response = sdk.preference().create(preference_data)
        
        print("\n=== RESPUESTA DE MERCADO PAGO ===")
        print(preference_response)
        print("=================================\n")

        preference = preference_response.get("response", {})

        if 'init_point' in preference:
            return Response({'init_point': preference['init_point']}, status=status.HTTP_200_OK)
        else:
            return Response({'error': str(preference)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)