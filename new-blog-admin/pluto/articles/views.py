# -*- coding: utf-8 -*-
import json
from . import constants
from users.models import HiUser
from django.utils import timezone
from django.http import HttpResponse
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Tag, Article, Comment, Like, Share
from django.shortcuts import render, get_object_or_404, Http404
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .serializers import ArticleSerializer, TagSerializer, CommentSerialier, LikeSerializer, PostLikeSerializer,PostCommentSerializer, PostArticleSerializer, DiggSerializer, ShareSerializer


# Create your views here.
class ArticleByTagView(generics.ListCreateAPIView):
    """
    return JSON {
        "count":page_article_count,
        "next":turn_next_page_url,
        "previous":turn_previous_page_url,
        "results":[
            {
                "id":article_id,
                "title":user_id,
                "author":article_editor,
                "abstracts":article_abstract,
                "content":article_content,
                "category":article_category,
                "source_type":article_type,
                "is_publish":False or True,
                "url":article_url,
                "tags":["cognos",],
                "imgs":picture_path,
                "created":article_create_time,
                "updated":article_update_time,
                "comment_count":article_comment_count
            },
            ...
        ]
    }
    """
    serializer_class = ArticleSerializer

    def get_queryset(self):
        tag = Tag.objects.get(name=self.kwargs['tag'])
        return tag.article_set.all()

    def get_paginate_by(self):
        return 20

class TopicView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    def get_queryset(self):
        topic = Article.objects.get(pk=self.kwargs['id'])
        return topic.subarticles.all()
    def get_paginate_by(self):
        return 20

class TagView(generics.ListAPIView):
    serializer_class = TagSerializer

    def get_queryset(self):
        return Tag.objects.all()
    
    def get_paginate_by(self):
        return 20
        
class CommentView(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly, )
    """
    return JSON {
        "count":page_comment_count,
        "next":turn_next_page_url,
        "previous":turn_previous_page_url,
        "results":[
            {
                "id":comment_id,
                "user":user_id,
                "article":article_id,
                "content":comment_content,
                "up":ding_count,
                "down":cai_count,
                "created":comment_create_time
            },
            ...
        ]
    }
    """
    serializer_class = CommentSerialier

    def get_queryset(self):
        article = Article.objects.get(id=self.kwargs['article_id'])
        return article.comment_set.all()

    def get_paginate_by(self):
        return 20
    
    def post(self, request, article_id):
        serializer = PostCommentSerializer(data={
            "article":article_id, 
            "user":request.user.id,
            "content":request.DATA.get('content'),
            "created": timezone.now()})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentSegmentView(generics.ListAPIView):
    """
    Method: GET
    parameter: count=20 & offset=0 & type=(new or all)
    descriptions:
        html segment for comments
    """
    def get(self, request, article_id):

        article = get_object_or_404( Article, pk=article_id )
        count = request.GET.get('count')
        offset = request.GET.get('offset')
        _type = request.GET.get('type')

        new_results_suffix = ''
        _comments = article.comment_set.all()[offset:offset+count]
        items = ""
        if _comments:
            for comment in _comments:
                user_id = comment.user_id
                user = get_object_or_404(HiUser, pk=user_id)
                avatar = ""
                items+='<div class="comment-content"><div class="avatar btn"><a class="btn">'
                if unicode(user.avatar) != "":
                    avatar = unicode(user.avatar)
                    items += '<img src="/media/'+avatar+'"></a>'
                else:
                    items += '<img src=""></a>'
                items += '</div>'+\
                    '<div class="name">'+\
                        '<a class="btn text-ellipsis" title="'+user.username+'">'+user.username+'</a>'+\
                    '</div>'+\
                    '<div class="time">'+comment.created.strftime("%y-%m-%d %H:%M:%S")+'</div>'+\
                    '<div class="content">'+\
                        '<a class="btn">'+comment.content+'</a>'+\
                    '</div>'+\
                    '<div class="action_pane">'+\
                        '<a class="btn digg" comment_id="'+str(comment.id)+'" bury_count="0" href="#" onClick="commentAction.digg(this); return false;">'+str(comment.up)+'</a>'+\
                    '</div>'+\
                '</div>' 
            new_results_suffix = constants.HAS_MORE_1
        else:
            new_results_suffix = constants.HAS_MORE_0

        if _type=='new':
            return HttpResponse(items + new_results_suffix )
        elif _type=='all':
            return HttpResponse( constants.ALL_COMMENTS_PREFIX + items + constants.ALL_COMMENTS_SUFFIX )

class ArticleView(generics.ListAPIView):
    """
    Method: GET
    descriptions:
        return template for html
    """
    def get(self, request, article_id):
        if request.GET.get('auth_token'):
            auth_token = request.GET['auth_token']
        else:
            auth_token = ''

        if Share.objects.filter(article=article_id):
            shared = True
        else:
            shared = False
        article = get_object_or_404(Article, pk=article_id )
        comments = article.comment_set.all()
        context = {
        'title': article.title, 
        'content':article.content, 
        'group_id':article.id,
        'author':article.author,
        'img':json.loads(article.imgs)[0],
        'comment_count':str(len(comments)), 
        'time':article.created.strftime("%y-%m-%d %H:%M:%S"),
        'auth_token':auth_token,
        'shared':shared
        }
        return render( request, 'articles/article.html', context )

class LikeView(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = LikeSerializer

    def get_queryset(self):

        user = self.request.user
        if  self.request.GET.get('article_id'):
            return user.like_set.all().filter(article=self.request.GET['article_id'])
        else:
            return user.like_set.all()

    def get_paginate_by(self):
        return 20
        
    def post(self, request, article_id):
        serializer = PostLikeSerializer(data={"article":article_id, "user":request.user.id, "created":timezone.now()})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_200_OK)

    def delete(self, request, article_id):
        user = request.user
        like = user.like_set.get(article=article_id)
        like.delete()
        return Response({"info":"cancel like is ok"}, status=status.HTTP_200_OK)

class CommentByUserView(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = CommentSerialier

    def get_queryset(self):
        user = self.request.user
        return user.comment_set.all()
    def get_paginate_by(self):
        return 20

class CommentActionView(generics.CreateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = CommentSerialier

    def post(self, request):
        user = request.user
        if self.request.POST.get('comment_id'):
            if self.request.POST.get('action'):
                comment_id = self.request.POST['comment_id']
                action_type = self.request.POST['action']
                if action_type == "digg":
                    serializer = DiggSerializer(data={"comment":comment_id, "user":user.id})
                    if serializer.is_valid():
                        comment = Comment.objects.get(id=comment_id)
                        Comment.objects.filter(id=comment_id).update(up=comment.up+1)
                        serializer.save()
                        return Response({"message":"ok","up":comment.up+1}, status=status.HTTP_200_OK)
                    else:
                        return Response({"message":"redigg"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error":"action type must be digg"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error":"form data must be contained 'action' field"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error":"form data must be contained 'comment_id' field"}, status=status.HTTP_400_BAD_REQUEST)

class ArticlePushView(generics.CreateAPIView):
    serializer_class = PostArticleSerializer

    def post(self, request):

        title = request.DATA.get('title')
        author = request.DATA.get('author')
        abstracts = request.DATA.get('abstracts')
        content = request.DATA.get('content')
        created = request.DATA.get('created')
        category = request.DATA.get('category')
        tags = request.DATA.get('tags')
        print tags
        imgs = request.DATA.get('imgs')
        updated =created
        data={
            "title":title, 
            "author":author,
            "abstracts":abstracts,
            "content":content,
            "category":category,
            "tags":tags,
            "imgs":imgs,
            "created":created,
            "updated":updated
        }
        serializer = PostArticleSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response({"error":"bad request"}, status=status.HTTP_400_BAD_REQUEST)

class ShareView(generics.ListCreateAPIView):
    serializer_class = ShareSerializer
    def get_queryset(self):
        return Share.objects.all()
    def get_paginate_by(self):
         return 20





