from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone

class HiUserManager(BaseUserManager):
    """
    Custom user manager
    """
    def _create_user(self, username, email, password, avatar,
                     is_staff, is_superuser, **extra_fields):
        """
        Creates and saves a User with the given username, email and password.
        """
        now = timezone.now()
        if not username:
            raise ValueError('The given username must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, avatar=avatar,
                          is_staff=is_staff, is_active=True,
                          is_superuser=is_superuser, last_login=now,
                          date_joined=now, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username, email=None, password=None, avatar="", **extra_fields):
        return self._create_user(username, email, password, avatar, False, False,
                                 **extra_fields)

    def create_superuser(self, username, email, password, **extra_fields):
        return self._create_user(username, email, password, "", True, True,
                                 **extra_fields)


class HiUser(AbstractUser):
    """
    Custom user model
    """
    avatar = models.ImageField(_('avatar image'), upload_to="avatars", blank=True)
    gender = models.SmallIntegerField(_('gender'), default=0)

    objects = HiUserManager()
