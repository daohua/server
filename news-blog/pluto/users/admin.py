from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm
from .models import HiUser

# Register your models here.
class HiUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = HiUser

class HiUserAdmin(UserAdmin):
    form = HiUserChangeForm

    fieldsets = UserAdmin.fieldsets + ((None, {'fields': ('avatar','gender',)}),)

admin.site.register(HiUser, HiUserAdmin)

