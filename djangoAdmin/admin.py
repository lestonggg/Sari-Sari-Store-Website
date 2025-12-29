# djangoAdmin/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User, Group
from server.models import AdminProfile, Product, Sale, Debtor, Inventory
from django.utils.html import format_html

class AdminProfileInline(admin.StackedInline):
    model = AdminProfile
    can_delete = False
    verbose_name_plural = 'Admin Security Details'
    readonly_fields = ('store_uuid',) 

class UserAdmin(BaseUserAdmin):
    inlines = (AdminProfileInline,)

    list_per_page = 20 
    list_display = ('username', 'short_uuid', 'get_access_code', 'email', 'full_name', 'is_staff', 'is_active')

    search_fields = ('username', 'email', 'adminprofile__store_uuid', 'adminprofile__access_code')

    def short_uuid(self, instance):
        try:
            full_uuid = str(instance.adminprofile.store_uuid)
            return format_html('<span title="{}">{}...</span>', full_uuid, full_uuid[:8])
        except AdminProfile.DoesNotExist:
            return '-'
    short_uuid.short_description = 'UUID'

    def full_name(self, instance):
        return f"{instance.first_name} {instance.last_name}".strip() or "-"
    full_name.short_description = 'NAME'

    def get_access_code(self, instance):
        try:
            return instance.adminprofile.access_code
        except AdminProfile.DoesNotExist:
            return '-'
    get_access_code.short_description = 'CODE'

admin.site.unregister(Group)
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('category', 'name', 'cost', 'price', 'quantity', 'admin')
    list_filter = ('category', 'admin')
    search_fields = ('name',)
    list_editable = ('cost', 'price', 'quantity')

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('get_category_name', 'product_count', 'low_stock_count', 'out_of_stock_count', 'admin')
    list_filter = ('admin', 'category')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        representative_ids = []
        categories = Product.objects.values('category', 'admin').distinct()
        
        for group in categories:
            first_id = Product.objects.filter(
                category=group['category'], 
                admin=group['admin']
            ).values_list('id', flat=True).first()
            if first_id:
                representative_ids.append(first_id)
        
        return qs.filter(id__in=representative_ids)

    def get_category_name(self, obj):
        return obj.get_category_display()
    get_category_name.short_description = 'Product Category'

    def product_count(self, obj):
        return Product.objects.filter(category=obj.category, admin=obj.admin).count()
    product_count.short_description = 'Number of Products'

    def low_stock_count(self, obj):
        return Product.objects.filter(
            category=obj.category, 
            admin=obj.admin, 
            quantity__lt=10, 
            quantity__gt=0
        ).count()
    low_stock_count.short_description = 'Low Stocks'

    def out_of_stock_count(self, obj):
        return Product.objects.filter(
            category=obj.category, 
            admin=obj.admin, 
            quantity=0
        ).count()
    out_of_stock_count.short_description = 'Out of Stocks'

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'admin', 'timestamp', 'total_amount', 'total_profit', 'payment_type')
    list_filter = ('payment_type', 'timestamp', 'admin')
    readonly_fields = ('timestamp',) 

@admin.register(Debtor)
class DebtorAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin', 'amount_owed', 'date_added', 'paid', 'paid_date')
    list_filter = ('paid', 'date_added', 'admin')
    search_fields = ('name',)
    list_editable = ('paid',)