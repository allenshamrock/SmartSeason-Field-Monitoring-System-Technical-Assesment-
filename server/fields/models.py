from django.db import models
from django.utils import timezone
from accounts.models import User

# Create your models here.

class Field(models.Model):
    STAGE_CHOICES = [
        ('planted', 'Planted'),
        ('growing', 'Growing'),
        ('ready', 'Ready'),
        ('harvested', 'Harvested')
    ]

    name = models.CharField(max_length=200)
    crop_type = models.CharField(max_length=100)
    planting_date = models.DateField()
    current_stage = models.CharField(max_length =20, choices=STAGE_CHOICES, default ='planted')
    location = models.CharField(max_length=300, blank=True)
    size_hectares = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    assigned_agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_fields',limit_choices_to={'role':'agent'})
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,related_name='created_fields')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expected_harvest_date = models.DateField(null=True, blank=True)
    last_updated_at = models.DateTimeField(null=True, blank=True)

    @property
    def status(self):
        """
        Completed - stage is 'harvested'
        At risk - if current stage is 'growing' or 'planted' and it's been more than 90 days since planting
        Active - everything else
        """
        today = timezone.now().date()
        days_since_planting = (today - self.planting_date).days

        if self.current_stage == 'harvested':
            return 'Completed'
        
        #At risk if it's been more than 90 days since planting and not harvested
        if self.current_stage in('planted','growing') and days_since_planting > 90:
            return 'at_risk'
        
        #At risk if no field update in 14days
        if self.last_update_at:
            days_since_updates = (timezone.now() - self.last_updated_at).days
            if days_since_updates > 14:
                return 'at_risk'
            elif days_since_planting > 14:
                #Never updated and it's been more than 14 days since planting
                return 'at_risk'

            return 'active'

        def __str__(self):
            return f"{self.name} - {self.crop_type} ({self.current_stage})"

        class Meta:
            db_table = 'fields'
            ordering = ['-created_at'] 

class FieldUpdate(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='updates')
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    stage = models.CharField(max_length=20, choices=Field.STAGE_CHOICES)
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self,*args, **kwargs):
        super().save(*args, **kwargs)
        #Update the field's current stage and last updated time
        self.field.current_stage = self.stage
        self.field.last_updated_at = timezone.now()
        self.field.save(update_fields=['current_stage','last_updated_at'])

    def __str__(self):
        return f"Update on {self.field.name} by{self.agent.username if self.agent else None} at {self.created_at} "
    
    class Meta:
        db_table = 'field_updates'
        ordering =  ['-created_at']