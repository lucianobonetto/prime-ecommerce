from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
import qrcode
from io import BytesIO
from django.core.files import File
from django.db.models.signals import post_save
from django.dispatch import receiver

# --- CATEGORÍA ---
class Categoria(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self): 
        return self.nombre

    class Meta:
        verbose_name_plural = "Categorías"

# --- PRODUCTO (Contenedor general) ---
class Producto(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)

    def __str__(self): 
        return self.nombre

# --- VARIANTE (Talles, Colores, Stock, SKU y QR Automático) ---
class Variante(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='variantes')
    sku = models.CharField(max_length=50, unique=True)
    talle = models.CharField(max_length=10, null=True, blank=True)
    color = models.CharField(max_length=50, null=True, blank=True)
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    descuento_porcentual = models.IntegerField(default=0)
    stock_disponible = models.PositiveIntegerField(default=0)
    qr_code = models.ImageField(upload_to='qrcodes/', blank=True, null=True)

    @property
    def precio_final(self):
        descuento = Decimal(self.descuento_porcentual) / Decimal(100)
        return self.precio_base * (Decimal(1) - descuento)

    def save(self, *args, **kwargs):
        if self.sku and not self.qr_code:
            qr_image = qrcode.make(self.sku)
            buffer = BytesIO()
            qr_image.save(buffer, format='PNG')
            file_name = f'qr-{self.sku}.png'
            self.qr_code.save(file_name, File(buffer), save=False)
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.producto.nombre} - {self.talle} / {self.color} ({self.sku})"

# --- CARRITO E ITEMS (Temporales) ---
class Carrito(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Carrito de {self.usuario.username}"

class ItemCarrito(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='items')
    variante = models.ForeignKey(Variante, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.cantidad} x {self.variante.sku}"

# --- PEDIDO E ITEMS (Historial inmutable) ---
class Pedido(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=50, default='pendiente')
    total_final = models.DecimalField(max_digits=10, decimal_places=2)
    payment_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Pedido #{self.id} - {self.estado}"

class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')
    variante = models.ForeignKey(Variante, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField()
    precio_historico = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cantidad} x {self.variante.producto.nombre} (Pedido {self.pedido.id})"

# --- NUEVO: PERFIL DE USUARIO ---
class PerfilUsuario(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    telefono = models.CharField(max_length=50, null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Perfil de {self.usuario.username}"

# Esto crea un Perfil en blanco automáticamente cada vez que se registra un User nuevo en Django
@receiver(post_save, sender=User)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    if created:
        PerfilUsuario.objects.create(usuario=instance)