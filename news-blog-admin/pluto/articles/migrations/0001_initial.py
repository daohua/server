# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime
from django.utils.timezone import utc
import ckeditor.fields
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=120)),
                ('author', models.CharField(max_length=50)),
                ('abstracts', models.CharField(max_length=400, blank=True)),
                ('content', ckeditor.fields.RichTextField()),
                ('category', models.SmallIntegerField(default=1)),
                ('source_type', models.SmallIntegerField(default=0)),
                ('is_publish', models.BooleanField(default=True)),
                ('url', models.CharField(max_length=200, blank=True)),
                ('imgs', models.CharField(max_length=5000, blank=True)),
                ('created', models.DateTimeField(default=datetime.datetime(2015, 11, 2, 15, 34, 10, 258681, tzinfo=utc))),
                ('updated', models.DateTimeField(default=datetime.datetime(2015, 11, 2, 15, 34, 10, 258706, tzinfo=utc))),
                ('subarticles', models.ManyToManyField(to='articles.Article', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content', models.TextField()),
                ('up', models.IntegerField(default=0)),
                ('created', models.DateTimeField(default=datetime.datetime(2015, 11, 2, 15, 34, 10, 261641, tzinfo=utc))),
                ('article', models.ForeignKey(to='articles.Article')),
                ('parent', models.ManyToManyField(to='articles.Comment', blank=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('-created',),
            },
        ),
        migrations.CreateModel(
            name='Digg',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('comment', models.ForeignKey(to='articles.Comment')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(default=datetime.datetime(2015, 11, 2, 15, 34, 10, 264213, tzinfo=utc))),
                ('article', models.ForeignKey(to='articles.Article')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('-created',),
            },
        ),
        migrations.CreateModel(
            name='Share',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('location', models.CharField(max_length=200)),
                ('article', models.ForeignKey(to='articles.Article')),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('category', models.SmallIntegerField(default=0)),
                ('weight', models.IntegerField(default=0)),
                ('created', models.DateTimeField(default=datetime.datetime(2015, 11, 2, 15, 34, 10, 257843, tzinfo=utc))),
            ],
        ),
        migrations.AddField(
            model_name='article',
            name='tags',
            field=models.ManyToManyField(to='articles.Tag'),
        ),
        migrations.AlterUniqueTogether(
            name='like',
            unique_together=set([('article', 'user')]),
        ),
        migrations.AlterUniqueTogether(
            name='digg',
            unique_together=set([('comment', 'user')]),
        ),
    ]
