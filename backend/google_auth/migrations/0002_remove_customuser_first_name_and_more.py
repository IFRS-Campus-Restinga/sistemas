# Generated by Django 5.2 on 2025-05-22 15:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('google_auth', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='last_login',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='last_name',
        ),
    ]
