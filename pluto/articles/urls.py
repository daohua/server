from django.conf.urls import patterns, include, url
from . import views

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browseable API.
urlpatterns =patterns('',

	url(r'^tag/(?P<tag>.+)/$', views.ArticleByTagView.as_view()),
	url(r'^tags/$', views.TagView.as_view()),
	url(r'^topic/(?P<id>.+)/$', views.TopicView.as_view()),
	url(r'^(?P<article_id>\d+)/$', views.ArticleView.as_view()),
   url(r'^(?P<article_id>\d+)/pagecomments/$', views.CommentSegmentView.as_view()),
   url(r'^(?P<article_id>.+)/comment/$', views.CommentView.as_view()),
   url(r'^(?P<article_id>.+)/like/$', views.LikeView.as_view()),
   url(r'^like/$', views.LikeView.as_view()),
   url(r'^user/comments/$', views.CommentByUserView.as_view()),
   url(r'^comment/action/$', views.CommentActionView.as_view()),
   url(r'^push/$', views.ArticlePushView.as_view()),
   url(r'^share/$', views.ShareView.as_view()),
)