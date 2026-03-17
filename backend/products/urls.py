from django.urls import path, include
from rest_framework.routers import DefaultRouter
# ¡Importante! Asegurate de agregar create_preference acá
from .views import CategoryViewSet, ProductViewSet, create_preference 

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Agregamos la ruta exacta para generar el pago
    path('create_preference/', create_preference, name='create_preference'), 
]