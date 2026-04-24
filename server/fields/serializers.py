from rest_framework import serializers
from . models import Field,FieldUpdate
from accounts.serializers import UserSerializer
from django.utils import timezone

class FieldUpdateSerializer(serializers.ModelSerializer):
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = FieldUpdate
        fields = ['id','stage','notes','created_at','agent_name','agent']
        read_only_fields = ['id', 'agent','created_at']

    def get_agent_name(self,obj):
            if obj.agent:
                return f"{obj.agent.first_name} {obj.agent.last_name}".strip() or obj.agent.username
            return  None

    def create(self,validated_data):
            validated_data['agent'] =self.context['request'].user
            return super().create(validated_data)

class FieldSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    assigned_detail_agents = UserSerializer(source='assigned_agent', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    recent_updates = serializers.SerializerMethodField()
    days_since_planting = serializers.SerializerMethodField()

    class Meta:
        model = Field
        fields = ['id', 'name','crop_type','planting_date','current_stage','status','location','size_hectares',
                  'assigned_agent','assigned_detail_agents','created_by','created_by_detail','created_at','updated_at',
                  'expected_harvest_date','recent_updates','days_since_planting'
                  ]
        read_only_fields = ['id','status','created_by','created_at','updated_at']

    def  get_recent_updates(self,obj):
            #Get the 3 most recent updates for the field
            updates = obj.updates.all()[:3]
            return FieldUpdateSerializer(updates,many=True).data
        
    def get_days_since_planting(self,obj):
            return (timezone.now().date() - obj.planting_date).days


    def create(self,validated_data):
            validated_data['created_by'] = self.context['request'].user
            return super().create(validated_data)

class DashboardSerializer(serializers.Serializer):
    total_fields = serializers.IntegerField()
    active_count = serializers.IntegerField()
    at_risk_count = serializers.IntegerField()
    completed_count =serializers.IntegerField()
    stage_breakdown = serializers.DictField()
    recent_updates = FieldUpdateSerializer(many=True)
