from django.contrib import admin
from .models import Category, Product, Order, OrderItem

# Tus catálogos (lo que ya tenías)
admin.site.register(Category)
admin.site.register(Product)

# --- NUEVA SECCIÓN DE VENTAS ---

# Esto nos permite ver los ítems (relojes) adentro de la pantalla de la orden
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0 # Para que no muestre filas vacías extra
    readonly_fields = ['price'] # Para no cambiar el precio histórico por error

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # Columnas que vas a ver en la lista principal de ventas
    list_display = ['id', 'status', 'total', 'created_at', 'payment_id']
    # Filtros laterales para buscar rápido
    list_filter = ['status', 'created_at']
    # Adjuntamos los relojes a la vista
    inlines = [OrderItemInline]