from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
import qrcode
from io import BytesIO
from django.core.files import File
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import MinValueValidator, MaxValueValidator

# --- CATEGORÍA ---
class Categoria(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self): 
        return self.nombre

    class Meta:
        verbose_name_plural = "Categorías"

# --- PRODUCTO ---
class Producto(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)

    def __str__(self): 
        return self.nombre

# --- VARIANTE ---
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

# --- CARRITO ---
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

# --- DIRECCIÓN ---
class Direccion(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='direcciones')
    calle = models.CharField(max_length=200)
    numero = models.CharField(max_length=50)
    codigo_postal = models.CharField(max_length=20)
    ciudad = models.CharField(max_length=100)
    telefono = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return f"{self.calle} {self.numero}, {self.ciudad}"

# --- PEDIDO (ESTANDARIZADO) ---
class Pedido(models.Model):
    # Definición de Estados Estandarizados
    PENDIENTE = 'pendiente'
    PAGADO = 'pagado'
    ENVIADO = 'enviado'
    ENTREGADO = 'entregado'
    FALLIDO = 'fallido'

    ESTADO_CHOICES = [
        (PENDIENTE, 'Pendiente'),
        (PAGADO, 'Pagado'),
        (ENVIADO, 'Enviado'),
        (ENTREGADO, 'Entregado'),
        (FALLIDO, 'Fallido'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default=PENDIENTE
    )
    total_final = models.DecimalField(max_digits=10, decimal_places=2)
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    
    metodo_envio = models.CharField(max_length=50, default='sucursal')
    envio_calle = models.CharField(max_length=200, null=True, blank=True)
    envio_numero = models.CharField(max_length=50, null=True, blank=True)
    envio_codigo_postal = models.CharField(max_length=20, null=True, blank=True)
    envio_ciudad = models.CharField(max_length=100, null=True, blank=True)
    envio_telefono = models.CharField(max_length=50, null=True, blank=True)
    envio_descripcion = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return f"Pedido #{self.id} - {self.get_estado_display()}"

class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')
    variante = models.ForeignKey(Variante, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField()
    precio_historico = models.DecimalField(max_digits=10, decimal_places=2)

# --- PERFIL ---
class PerfilUsuario(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    telefono = models.CharField(max_length=50, null=True, blank=True)

@receiver(post_save, sender=User)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    if created:
        PerfilUsuario.objects.create(usuario=instance)

# --- RESEÑAS (ACTUALIZADO) ---
class Resena(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='resenas')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resenas')
    # Vinculamos al pedido para saber si es "Compra Verificada"
    pedido = models.ForeignKey(Pedido, on_delete=models.SET_NULL, null=True, blank=True, related_name='resenas')
    
    rating = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comentario = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    aprobado = models.BooleanField(default=True)

    class Meta:
        ordering = ['-fecha_creacion']
        unique_together = ('usuario', 'producto') # Un usuario solo puede reseñar un producto una vez

    def __str__(self):
        return f"{self.rating}★ - {self.usuario.username} para {self.producto.nombre}"