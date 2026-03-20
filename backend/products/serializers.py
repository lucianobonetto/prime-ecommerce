from rest_framework import serializers
from .models import Categoria, Producto, Variante

class VarianteSerializer(serializers.ModelSerializer):
    # Agregamos precio_final como un campo extra que calculamos en el modelo
    precio_final = serializers.ReadOnlyField()

    class Meta:
        model = Variante
        # Usamos los nombres exactos de tu diagrama y modelos
        fields = ['id', 'sku', 'talle', 'color', 'precio_base', 'descuento_porcentual', 'stock_disponible', 'precio_final']

class ProductSerializer(serializers.ModelSerializer):
    # Esto anida las variantes adentro del producto (usamos el related_name del modelo)
    variantes = VarianteSerializer(many=True, read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'categoria_nombre', 'variantes']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']