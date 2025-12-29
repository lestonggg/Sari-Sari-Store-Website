# server/views.py
import json
from django.utils import timezone
from decimal import Decimal
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import AdminProfile, Product, Sale, Debtor
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required

@csrf_protect
def login_view(request):
    if request.user.is_authenticated:
        try:
            profile = AdminProfile.objects.get(user=request.user)
            return redirect('dashboard', store_uuid=profile.store_uuid)
        except AdminProfile.DoesNotExist:
            logout(request)

    if request.method == 'POST':
        u = request.POST.get('username')
        p = request.POST.get('password')
        ac = request.POST.get('access_code')
        
        user = authenticate(request, username=u, password=p)
        
        if user is not None:
            try:
                profile = AdminProfile.objects.get(user=user)
                if profile.access_code == ac:
                    login(request, user)
                    return redirect('dashboard', store_uuid=profile.store_uuid)
                else:
                    messages.error(request, "Invalid Access Code.")
            except AdminProfile.DoesNotExist:
                messages.error(request, "Access Code profile not set up for this user.")
        else:
            messages.error(request, "Invalid Username or Password.")
            
    return render(request, 'server/index.html')

@login_required
def dashboard_view(request, store_uuid):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        profile = AdminProfile.objects.get(user=request.user, store_uuid=store_uuid)
    except AdminProfile.DoesNotExist:
        messages.error(request, "Store session expired or invalid store ID. Please login again.")
        return redirect('login')

    products = list(Product.objects.filter(admin=profile).values())
    sales = list(Sale.objects.filter(admin=profile).values())
    debtors = list(Debtor.objects.filter(admin=profile).values())

    context = {
        'products_json': json.dumps(products, default=str), 
        'sales_json': json.dumps(sales, default=str),
        'debtors_json': json.dumps(debtors, default=str),
        'current_uuid': store_uuid, 
    }

    return render(request, 'server/dashboard.html', context)

@login_required
def process_sale(request):
    if request.method == 'POST':
        try:
            profile = AdminProfile.objects.get(user=request.user)
            data = json.loads(request.body)
            cart_items = data.get('cart', [])
            payment_type = data.get('payment_type')
            customer_name = data.get('customer_name')

            total_amount = Decimal('0.00') 
            total_profit = Decimal('0.00') 

            for item in cart_items:
                product = get_object_or_404(Product, id=item['id'], admin=profile)
                qty_bought = int(item['quantity'])
                product.quantity -= qty_bought
                product.save()

                price = Decimal(str(item['price']))
                cost = Decimal(str(item['cost']))
                total_amount += price * qty_bought
                total_profit += (price - cost) * qty_bought

            Sale.objects.create(
                admin=profile, 
                total_amount=total_amount,
                total_profit=total_profit,
                payment_type=payment_type,
                items=cart_items
            )

            if payment_type == 'credit' and customer_name:
                debtor, created = Debtor.objects.get_or_create(
                    admin=profile, 
                    name=customer_name,
                    defaults={'amount_owed': total_amount, 'items': cart_items}
                )
                if not created:
                    debtor.amount_owed += total_amount
                    current_items = debtor.items if isinstance(debtor.items, list) else []
                    debtor.items = current_items + cart_items
                    debtor.save()

            return JsonResponse({
                'status': 'success', 
                'updated_products': list(Product.objects.filter(admin=profile).values()),
                'updated_debtors': list(Debtor.objects.filter(admin=profile).values()),
                'updated_sales': list(Sale.objects.filter(admin=profile).values()) 
            })

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

@login_required 
def add_product(request):
    if request.method == 'POST':
        try:
            profile = AdminProfile.objects.get(user=request.user)
            data = json.loads(request.body)
            action = data.get('action')

            if action == 'delete':
                Product.objects.filter(id=data['id'], admin=profile).delete()
                return JsonResponse({'status': 'success'})

            elif action == 'update_qty':
                p = get_object_or_404(Product, id=data['id'], admin=profile)

                if data.get('type') == 'delta':
                    p.quantity += int(data.get('change', 0))
                else:
                    p.quantity = int(data.get('new_qty', p.quantity))

                if 'new_cost' in data:
                    p.cost = Decimal(str(data['new_cost']))
                if 'new_price' in data:
                    p.price = Decimal(str(data['new_price']))
                
                p.save()
                return JsonResponse({'status': 'success'})

            elif action == 'add_new':
                new_p = Product.objects.create(
                    admin=profile,
                    name=data['name'],
                    category=data['category'],
                    cost=Decimal(str(data['cost'])),
                    price=Decimal(str(data['price'])),
                    quantity=int(data['quantity'])
                )
                return JsonResponse({'status': 'success', 'product_id': new_p.id})

            return JsonResponse({'status': 'error', 'message': 'Unknown inventory action.'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'failed', 'message': 'Invalid request method.'}, status=405)

def clear_sales_history(request):
    if request.method == 'POST':
        try:
            Sale.objects.all().delete()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
        
    return JsonResponse({'status': 'failed'})

@login_required
def mark_debt_paid(request):
    if request.method == 'POST':
        try:
            profile = AdminProfile.objects.get(user=request.user)
            data = json.loads(request.body)
            debtor_id = data.get('id')
            debtor = Debtor.objects.get(id=debtor_id, admin=profile)

            debtor.paid = True
            debtor.paid_date = timezone.now()
            debtor.save()

            return JsonResponse({
                'status': 'success',
                'updated_debtors': list(Debtor.objects.filter(admin=profile).values())
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'failed'})

@login_required
def delete_debtor(request):
    if request.method == 'POST':
        try:
            profile = AdminProfile.objects.get(user=request.user)
            data = json.loads(request.body)
            debtor_id = data.get('id')

            debtor = get_object_or_404(Debtor, id=debtor_id, admin=profile)

            if not debtor.paid:
                items = debtor.items if isinstance(debtor.items, list) else []
                for item in items:
                    try:
                        product = Product.objects.get(id=item['id'], admin=profile)
                        product.quantity += int(item['quantity'])
                        product.save()
                    except Product.DoesNotExist:
                        continue

            debtor.delete()

            return JsonResponse({
                'status': 'success',
                'updated_debtors': list(Debtor.objects.filter(admin=profile).values()),
                'updated_products': list(Product.objects.filter(admin=profile).values())
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
            
    return JsonResponse({'status': 'failed'})

def logout_view(request):
    logout(request)
    return redirect('login')