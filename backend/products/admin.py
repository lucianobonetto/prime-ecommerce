from django.contrib import admin
from .models import Categoria, Producto, Variante, Pedido, ItemPedido

admin.site.register(Categoria)
admin.site.register(Producto)
admin.site.register(Variante)
admin.site.register(Pedido)
admin.site.register(ItemPedido)