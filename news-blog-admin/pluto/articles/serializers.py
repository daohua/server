# -*- coding: utf-8 -*-
import json
from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Tag, Article, Comment, Like, Digg, Share


class ArticleSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    comment_count = serializers.SerializerMethodField('get_comment_count')
    imgs = serializers.SerializerMethodField('get_imgs_for_json_arr')
    class Meta:
        model = Article
        fields = ('id', 'title', 'author', 'abstracts', 'content', 'category', 'source_type', 'is_publish',
                'url', 'tags', 'imgs', 'created', 'updated', 'comment_count')
        write_only_fields = ('content',)
    def get_comment_count(self, obj):
        comments = Comment.objects.all().filter(article=obj.id)
        return comments.count
    def get_imgs_for_json_arr(self, obj):
        return json.loads(obj.imgs)

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'category')

class TopicSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    class Meta:
        model = Article
        fields = ('id', 'title', 'author', 'abstracts', 'category', 'source_type', 'is_publish',
                'url', 'subarticles', 'created')
        read_only_fields = ('created',)

class CommentSerialier(serializers.ModelSerializer):
    article = ArticleSerializer()
    class Meta:
        model = Comment
        fields = ( 'id', 'user', 'article', 'content', 'up', 'created' )
        read_only_fields = ('created', )

class LikeSerializer(serializers.ModelSerializer):
    article = ArticleSerializer()
    class Meta:
        model = Like
        fields = ('id', 'user', 'article', 'created')
        read_only_fields = ('created',  )

class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('id', 'user', 'article', 'created')

class PostCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ( 'id', 'user', 'article', 'content', 'created' )

class PostArticleSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True, slug_field='name')
    class Meta:
        model = Article
        fields = ('id', 'title', 'author', 'abstracts', 'content', 'category', 'tags', 'imgs', 'created', 'updated')
        write_only_fields = ('content', )

class DiggSerializer(serializers.ModelSerializer):
    class Meta:
        model = Digg
        fields = ('id', 'user', 'comment')

class ShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Share
        fields = ('id', 'article', 'location')







