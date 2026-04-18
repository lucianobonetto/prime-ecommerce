from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import CategoryViewSet, ProductViewSet, create_preference, mercadopago_webhook, mercadopago_redirect

from . import views

router = DefaultRouter()
router.register(r'categorias', views.CategoryViewSet)
router.register(r'productos', views.ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # --- AUTENTICACIÓN ---
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('registro/', views.registro_usuario, name='registro_usuario'),
    
    # --- MERCADO PAGO ---
    path('create_preference/', views.create_preference, name='create_preference'),
    path('webhook/', views.mercadopago_webhook, name='webhook'),
    path('mp-redirect/', mercadopago_redirect, name='mp_redirect'),

    # --- PERFIL CLIENTE --- 
    path('mi-perfil/', views.mi_perfil, name='mi-perfil'),
    path('mis-pedidos/', views.mis_pedidos, name='mis-pedidos'),
    path('mis-direcciones/', views.mis_direcciones, name='mis-direcciones'),
    path('mis-direcciones/<int:pk>/', views.direccion_detalle, name='direccion-detalle'),

    # --- PANEL DE ADMINISTRADOR ---
    path('admin/pedidos/', views.admin_pedidos, name='admin-pedidos'),
    path('admin/pedidos/<int:pk>/estado/', views.admin_actualizar_pedido, name='admin-actualizar-pedido'),
    path('admin/usuarios/', views.admin_usuarios, name='admin-usuarios'),
    path('admin/crear-producto/', views.crear_producto_con_variante, name='crear_producto'),
    path('admin/productos-completos/', views.admin_productos, name='admin_productos'),
    path('admin/editar-producto/<int:pk>/', views.admin_editar_producto, name='admin_editar_producto'),
    path('admin/sumar-stock/', views.admin_sumar_stock, name='admin_sumar_stock'),
    path('admin/productos/<int:producto_id>/variantes/', views.admin_crear_variante, name='admin_crear_variante'),
    
    # ---> ACÁ ESTÁ LA RUTA DEL INTERRUPTOR QUE SOLUCIONA EL ERROR 404 <---
    path('admin/productos/<int:pk>/toggle-visibilidad/', views.admin_toggle_visibilidad, name='admin_toggle_visibilidad'),

    # --- RESEÑAS ---
    path('productos/<int:producto_id>/resenas/', views.crear_resena, name='crear-resena'),
    path('productos/<int:producto_id>/puedo-comentar/', views.verificar_compra_entregada, name='verificar_compra'),
]