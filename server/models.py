# server/models.py
import uuid
from django.db import models
from django.contrib.auth.models import User

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    store_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    access_code = models.CharField(max_length=50)

    def __str__(self): return self.user.username

class Product(models.Model):
    admin = models.ForeignKey(AdminProfile, on_delete=models.CASCADE, related_name='products')

    CATEGORY_CHOICES = [
        ('bath', 'Bath, Hygiene & Laundry Soaps'),
        ('foods', 'Whole Foods'),
        ('beverages', 'Beverages'),
        ('school', 'School Supplies'),
        ('liquor', 'Hard Liquors'),
        ('snacks', 'Snacks'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.category})"
    
class Inventory(Product):
    class Meta:
        proxy = True
        verbose_name = "Inventory"
        verbose_name_plural = "Inventories"

class Sale(models.Model):
    admin = models.ForeignKey(AdminProfile, on_delete=models.CASCADE, related_name='sales')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_profit = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=10, choices=[('cash', 'Cash'), ('credit', 'Credit')])
    items = models.JSONField(default=list, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self): return f"Sale {self.id} - ₱{self.total_amount}"

class Debtor(models.Model):
    admin = models.ForeignKey(AdminProfile, on_delete=models.CASCADE, related_name='debtors')
    name = models.CharField(max_length=100)
    amount_owed = models.DecimalField(max_digits=10, decimal_places=2)
    items = models.JSONField(default=list, blank=True, null=True)   
    date_added = models.DateTimeField(auto_now_add=True)
    paid = models.BooleanField(default=False)
    paid_date = models.DateTimeField(null=True, blank=True)

    def __str__(self): 
        status = "PAID" if self.paid else "OWED"
        return f"{self.name} - ₱{self.amount_owed} ({status})"