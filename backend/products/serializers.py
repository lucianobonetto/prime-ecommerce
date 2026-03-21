from rest_framework import serializers
from .models import Categoria, Producto, Variante

class VarianteSerializer(serializers.ModelSerializer):
    # Agregamos precio_final como un campo extra que calculamos en el modelo
    precio_final = serializers.ReadOnlyField()

    class Meta:
        model = Variante
        fields = ['id', 'sku', 'talle', 'color', 'precio_base', 'descuento_porcentual', 'stock_disponible', 'precio_final']

class ProductSerializer(serializers.ModelSerializer):
    variantes = VarianteSerializer(many=True, read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    # NUEVO: Traducimos 'imagen' de Django a 'image' para React, y forzamos la URL
    image = serializers.ImageField(source='imagen', read_only=True)

    class Meta:
        model = Producto
        # Agregamos 'image' a la lista para que viaje hacia el Frontend
        fields = ['id', 'nombre', 'descripcion', 'categoria_nombre', 'image', 'variantes']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']