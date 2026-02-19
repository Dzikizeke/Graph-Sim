from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class CustomUser(AbstractUser):
    # Add custom fields here if needed
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    # Make email unique and required
    email = models.EmailField(unique=True)
    
    def __str__(self):
        return self.username

    class Meta:
        db_table = 'auth_user'
