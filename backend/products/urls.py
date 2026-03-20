from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Importamos las funciones y ViewSets que definimos en views.py
from .views import CategoryViewSet, ProductViewSet, create_preference, mercadopago_webhook

router = DefaultRouter()
# Registramos las rutas del catálogo
router.register(r'categorias', CategoryViewSet)
router.register(r'productos', ProductViewSet)

urlpatterns = [
    # Las rutas generadas por el router (categorias/ y productos/)
    path('', include(router.urls)),
    
    # Ruta para iniciar el pago con Mercado Pago
    path('create_preference/', create_preference, name='create_preference'),
    
    # Ruta que escuchará las notificaciones automáticas de Mercado Pago
    path('webhook/', mercadopago_webhook, name='webhook'),
]