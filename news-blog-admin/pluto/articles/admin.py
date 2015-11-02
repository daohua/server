# -*- coding: utf-8 -*-
from django.contrib import admin
from .models import Tag, Article, Comment, Like


class ArticleAdmin(admin.ModelAdmin):

	fields = ('title', 'author', 'abstracts', 'content', 'category', 'is_publish', ('imgs', 'url'), 'tags', 'subarticles', ('created', 'updated'))
	actions = ['make_head_img', 'make_article_link', 'filter_imgs_style']
	
	def make_head_img(self, request, queryset):
		import json
		from lxml import etree
		for article in queryset:
			page = etree.HTML(article.content)
			if page.xpath('//img'):
				imgs_arr = []
				for img in page.xpath('//img'):
					imgs_arr.append(img.attrib['src'])
				Article.objects.filter(id=article.id).update(imgs=json.dumps(imgs_arr))

	def make_article_link(self, request, queryset):
		rows = len(queryset)
		for article in queryset:
			Article.objects.filter(id=article.id).update(url='/api/article/'+str(article.id))
		if rows == 1:
			message = "1 article was"
		else:
			message = "%s articles were" %rows

		return self.message_user(request, "%s successfully made access link" % message)

	def filter_imgs_style(self, request, queryset):
		from lxml import etree
		for article in queryset:
			page = etree.HTML(article.content)
			mycontent = article.content
			updated = False
			if page.xpath('//img'):
				for img in page.xpath('//img'):
					try:
						if img.attrib['style']:
							mycontent = mycontent.replace(img.attrib['style'], '')
							updated = True
					except Exception, e:
						print 'no attrib %s' %e
					
				if updated:
					Article.objects.filter(id=article.id).update(content=mycontent)

	make_article_link.short_description = "Make selected articles access link"
	make_head_img.short_description = "Make selected articles head image"
	filter_imgs_style.short_description = "filter selected articles images style"

admin.site.register(Tag)
admin.site.register(Article, ArticleAdmin)
admin.site.register(Comment)
admin.site.register(Like)
