from django.core.exceptions import ImproperlyConfigured


def get(key):
    from django.conf import settings
    defaults = {
        'LOGIN_AFTER_REGISTRATION': True,
        'LOGIN_AFTER_ACTIVATION': False,
        'SEND_ACTIVATION_EMAIL': False,
        'SET_PASSWORD_RETYPE': False,
        'SET_USERNAME_RETYPE': False,
        'PASSWORD_RESET_CONFIRM_RETYPE': False,
    }
    defaults.update(getattr(settings, 'USERS', {
        "DOMAIN":"127.0.0.1:8080", 
        "SITE_NAME":"cn.ibm.com",
        "PASSWORD_RESET_CONFIRM_URL":"",
        }))
    try:
        return defaults[key]
    except KeyError:
        raise ImproperlyConfigured('Missing settings: USERS[\'{}\']'.format(key))
