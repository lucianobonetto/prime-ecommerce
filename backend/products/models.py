from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre de la Categoría")
    slug = models.SlugField(unique=True, help_text="URL amigable (ej: relojes-inteligentes)")

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200, verbose_name="Nombre del Producto")
    description = models.TextField(verbose_name="Descripción")
    base_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Base")
    is_active = models.BooleanField(default=True, verbose_name="¿Está activo?")
    created_at = models.DateTimeField(auto_now_add=True)
    # --- NUEVA LÍNEA PARA LA IMAGEN ---
    image = models.ImageField(upload_to='products/', null=True, blank=True, verbose_name="Imagen Principal")
    
    base_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Base")
    is_active = models.BooleanField(default=True, verbose_name="¿Está activo?")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    color = models.CharField(max_length=50, blank=True, null=True, verbose_name="Color")
    size = models.CharField(max_length=50, blank=True, null=True, verbose_name="Talle/Medida")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock disponible")
    
    def __str__(self):
        return f"{self.product.name} - {self.color or ''} {self.size or ''}"
# acá arriba están las clases Category y Product

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('paid', 'Pagado'),
        ('failed', 'Rechazado'),
    )
    
    # ID del pago que nos devuelva Mercado Pago (para rastrearlo)
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Orden #{self.id} - {self.get_status_display()}"

class OrderItem(models.Model):
    # Conectamos este ítem con su orden general
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    # Conectamos con el producto que compró
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    # Guardamos el precio en este momento (por si mañana el reloj aumenta de precio)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} (Orden #{self.order.id})"