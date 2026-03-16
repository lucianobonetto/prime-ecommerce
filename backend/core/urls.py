from django.contrib import admin
from django.urls import path, include
from django.conf import settings # Importante
from django.conf.urls.static import static # Importante

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')), 
]

# Esto le dice a Django cómo servir las imágenes en modo desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)