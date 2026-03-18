from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Asegurate de que esta línea esté así:
from .views import CategoryViewSet, ProductViewSet, create_preference, mercadopago_webhook

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create_preference/', create_preference, name='create_preference'),
    # ¡Y acá cambiamos views.mercadopago_webhook por la función directa!
    path('webhook/', mercadopago_webhook, name='webhook'),
]