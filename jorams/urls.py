"""
URL configuration for jorams project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# jorams/urls.py
from django.contrib import admin
from django.urls import path
from server.views import login_view, dashboard_view, logout_view, process_sale, clear_sales_history, mark_debt_paid, add_product, delete_debtor

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', login_view, name='login'), 
    path('dashboard/<uuid:store_uuid>/', dashboard_view, name='dashboard'), 
    path('add-product/', add_product, name='add_product'),
    path('process-sale/', process_sale, name='process_sale'),
    path('clear-sales-history/', clear_sales_history, name='clear_sales_history'),
    path('mark-debt-paid/', mark_debt_paid, name='mark_debt_paid'),
    path('delete-debtor/', delete_debtor, name='delete_debtor'),
    path('logout/', logout_view, name='logout'),
]