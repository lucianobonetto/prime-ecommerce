from rest_framework import serializers
from .models import Categoria, Producto, Variante, Resena

class VarianteSerializer(serializers.ModelSerializer):
    # Agregamos precio_final como un campo extra que calculamos en el modelo
    precio_final = serializers.ReadOnlyField()

    class Meta:
        model = Variante
        fields = ['id', 'sku', 'talle', 'color', 'precio_base', 'descuento_porcentual', 'stock_disponible', 'precio_final']

class ResenaSerializer(serializers.ModelSerializer):
    # Campos calculados para que encajen perfecto con tu diseño de React
    autor = serializers.SerializerMethodField()
    fecha = serializers.DateTimeField(source='fecha_creacion', format="%d %b %Y", read_only=True)

    class Meta:
        model = Resena
        fields = ['id', 'autor', 'fecha', 'rating', 'comentario']

    def get_autor(self, obj):
        if obj.usuario:
            # Intenta sacar nombre y apellido, si están vacíos usa el username
            nombre_completo = f"{obj.usuario.first_name} {obj.usuario.last_name}".strip()
            return nombre_completo if nombre_completo else obj.usuario.username
        return 'Usuario Invitado'

class ProductSerializer(serializers.ModelSerializer):
    variantes = VarianteSerializer(many=True, read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    image = serializers.ImageField(source='imagen', read_only=True)
    
    # NUEVO: Traemos todas las reseñas asociadas a este producto
    resenas = ResenaSerializer(many=True, read_only=True)

    class Meta:
        model = Producto
        # Agregamos 'resenas' para que viajen al frontend
        fields = ['id', 'nombre', 'descripcion', 'categoria_nombre', 'image', 'variantes', 'resenas']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']