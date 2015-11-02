from django.db import models
from django.utils import timezone
from ckeditor.fields import RichTextField
from users.models import HiUser

# Create your models here.
class Tag(models.Model):
	name = models.CharField(max_length=100)
  	category = models.SmallIntegerField(default=0)
  	weight = models.IntegerField(default=0)
  	created = models.DateTimeField(default=timezone.now())
  	def __unicode__(self):
  		return '%d:%s' %(self.pk,self.name)

class Article(models.Model):

	title = models.CharField(max_length=120)
	author = models.CharField(max_length=50)
	abstracts = models.CharField(max_length=400,blank=True)
	content = RichTextField()
	category = models.SmallIntegerField(default=1)
	source_type = models.SmallIntegerField(default=0)
	is_publish = models.BooleanField(default=True)
	url = models.CharField(max_length=200, blank=True)
	tags = models.ManyToManyField(Tag)
	imgs = models.CharField(max_length=5000, blank=True)
	subarticles = models.ManyToManyField('self', symmetrical=False, blank=True)
	created = models.DateTimeField(default=timezone.now())
	updated = models.DateTimeField(default=timezone.now())

	def __unicode__(self):
		return '%d:%s' %(self.pk,self.title)

class Comment(models.Model):
    user = models.ForeignKey(HiUser)
    article = models.ForeignKey(Article)
    parent = models.ManyToManyField('self', symmetrical=False, blank=True)
    content = models.TextField()
    up = models.IntegerField(default=0)
    created = models.DateTimeField(default=timezone.now())
    class Meta:
    	ordering = ('-created', )

    def __unicode__(self):
    	return '%d:%s comment to %s' %( self.pk, self.user.username, self.article.title )

class Like(models.Model):
	article = models.ForeignKey(Article)
	user = models.ForeignKey(HiUser)
	created = models.DateTimeField(default=timezone.now())
	
	class Meta:
		ordering = ('-created', )
		unique_together = (('article', 'user'), )

	def __unicode__(self):
		return '%d:%s' %(self.pk,self.article.title)

class Digg(models.Model):
	user = models.ForeignKey(HiUser)
	comment = models.ForeignKey(Comment)

	class Meta:
		unique_together=(('comment', 'user'), )

	def __unicode__(self):
		return '%d:%s:%s' %(self.pk, self.user, self.comment)

class Share(models.Model):
	article = models.ForeignKey(Article)
	location = models.CharField(max_length=200)

	def __unicode__(self):
		return '%d: %s shared' %(self.pk, self.article)


















	


