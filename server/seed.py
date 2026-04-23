import os, django 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from fields.models import Field,FieldUpdate
from django.utils import timezone
from datetime import date, timedelta

print("Seeding data...")

admin, _ = User.objects.get_or_create(username='allen',defaults={
    'email': 'allen@smartsession.com',
    'role':'admin',
    'first_name':'Allen',
    'last_name':'Shamrock',
    'is_staff':True,
})

admin.set_password('admin123')
admin.save()

agent1,_ = User.objects.get_or_create(username='john_agent',defaults={
    'email':'john@smartsession.com',
    'role':'agent',
    'first_name':'John',
    'last_name':'Kamau',

})
agent1.set_password('agent123')
agent1.save()

agent2,_ = User.objects.get_or_create(username='mary_agent',defaults={
    'email':'mary@smartsession.com',
    'role':'agent',
    'first_name':'Mary',
    'last_name':'Amollo',

})
agent1.set_password('agent123')
agent1.save()


fields_data = [
    dict(name='Northlands Farm',
        crop_type='Maize',
        planting_date= date.today() - timedelta(days=30),
        current_stage='growing',
        assigned_agent=agent1,
        created_by=admin,
        location='Block A North'),
    dict(name='Green Acres',
        crop_type='Wheat',
        planting_date= date.today() - timedelta(days=60),   
        current_stage='planted',
        assigned_agent=agent2,
        created_by=admin,
        location='Block B South'),
    dict(name='Sunny Fields',
        crop_type='Soybeans',
        planting_date= date.today() - timedelta(days=120),
        current_stage='harvested',
        assigned_agent=agent1,
        created_by=admin,
        location='Block C East'),           
]

for field_data in fields_data:
    f,created = Field.objects.get_or_create(name=field_data['name'],defaults={**field_data,'created_by':admin})
    if created:
        FieldUpdate.objects.create(field=f,agent=field_data['assigned_agent'], stage=field_data['current_stage'], notes ='Initial field assesment done')
        print(f"Created field:{f.name}")

print("Seeding completed.")