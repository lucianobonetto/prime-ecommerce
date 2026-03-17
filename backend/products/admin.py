from django.contrib import admin
from .models import Category, Product, ProductVariant

# Esto permite cargar variantes (colores/talles) dentro de la misma pantalla del producto
class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductVariantInline]
    list_display = ('name', 'category', 'base_price', 'is_active') # Columnas que vas a ver en la lista
    list_filter = ('category', 'is_active') # Filtros laterales
    search_fields = ('name',)

class CategoryAdmin(admin.ModelAdmin):
    # Esto autocompleta el slug (URL) mientras escribís el nombre de la categoría
    prepopulated_fields = {'slug': ('name',)} 

# Registramos todo en el panel
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)