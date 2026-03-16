from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Conectamos las rutas de nuestros productos bajo el prefijo "api/"
    path('api/', include('products.urls')), 
]
