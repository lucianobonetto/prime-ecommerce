from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Importamos el archivo views completo desde la misma carpeta (.)
from . import views

router = DefaultRouter()
# Registramos las rutas automáticas del catálogo
router.register(r'categorias', views.CategoryViewSet)
router.register(r'productos', views.ProductViewSet)

urlpatterns = [
    # Rutas generadas por el router (categorias/ y productos/)
    path('', include(router.urls)),
    
    # --- NUEVAS RUTAS DE AUTENTICACIÓN ---
    # Genera el token (Login)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Renueva el token si se vence
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Ruta para registrar un nuevo usuario
    path('registro/', views.registro_usuario, name='registro_usuario'),
    
    # Ruta para iniciar el pago con Mercado Pago
    path('create_preference/', views.create_preference, name='create_preference'),
    
    # Ruta que escuchará las notificaciones automáticas de Mercado Pago
    path('webhook/', views.mercadopago_webhook, name='webhook'),

    # Rutas para el Perfil 
    path('mi-perfil/', views.mi_perfil, name='mi-perfil'),
    path('mis-pedidos/', views.mis_pedidos, name='mis-pedidos'),

    # Rutas para la Libreta de Direcciones 
    path('mis-direcciones/', views.mis_direcciones, name='mis-direcciones'),
    path('mis-direcciones/<int:pk>/', views.direccion_detalle, name='direccion-detalle'),
]