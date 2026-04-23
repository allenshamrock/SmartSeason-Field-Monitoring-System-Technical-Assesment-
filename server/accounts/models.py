from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('agent', 'Field Agent')
    ]
    role = models.CharField(max_length=10,choices=ROLE_CHOICES,default='agent')
    phone = models.CharField(max_length=10, blank=True, null=True)

    def is_admin(self):
        return self.role == 'admin'
    
    def is_agent(self):
        return self.role == 'agent'
    
    class Meta:
        db_table = 'users'