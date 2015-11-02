from django.conf.urls import patterns, include, url
from django.contrib import admin
# for serving uploaded files during development
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'pluto.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^ckeditor/', include('ckeditor.urls')),
    url(r'^account/', include('account.urls')),
    url(r'^api/users/', include('users.urls')),
    url(r'^api/article/', include('articles.urls')),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

