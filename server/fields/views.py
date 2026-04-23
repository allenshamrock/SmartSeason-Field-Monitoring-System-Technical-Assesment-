from django.shortcuts import render
from rest_framework import generics,permissions,status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from .models import Field, FieldUpdate
from .serializers import FieldSerializer, FieldUpdateSerializer
from .permissions import IsAdminUser, IsAdminOrReadOnly
from rest_framework.exceptions import PermissionDenied
from accounts.models import User as UserModel

# Create your views here.

class FieldListCreateView(generics.ListCreateAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            queryset = Field.object.all()
        
        else:
            queryset = Field.objects.filter(assigned_agent=user)

            #Filtering based on query params
            stage = self.request.query_params.get('stage')
            if stage:
                queryset = queryset.filter(current_stage=stage)
            
            crop = self.request.query_params.get('crop_type')
            if crop:    
                queryset = queryset.filter(crop_type__icontains=crop)
            
            return queryset.select_related('assigned_agent','created_by')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        
        return [permissions.IsAuthenticated()]
    
class FieldDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Field.objects.all()
        
        return Field.objects.filter(assigned_agent=user)
    
    def get_permissions(self):
        if self.request.method in('PUT','PATCH','DELETE'):
            if self.request.method == 'DELETE':
                return [IsAdminUser()]
            return [IsAdminOrReadOnly()]
        return [permissions.IsAuthenticated()]
    
    def perform_update(self,serializer):
        #Agents cannot change assigned agent or crop type
        user = self.request.user
        if not user.is_admin():
            serializer.save(assigned_agent=serializer.instance.assigned_agent, crop_type=serializer.instance.crop_type)
        
        else:
            serializer.save()

class FieldUpdateListCreateView(generics.ListCreateAPIView):
    serializer_class = FieldUpdateSerializer

    def get_queryset(self):
        user = self.request.user
        field_id = self.kwargs.get['field_id']
        query_set = FieldUpdate.objects.filter(field_id=field_id).select_related('agent')
        if not user.is_admin():
            query_set = query_set.filter(field__assigned_agent=user)
        
        return query_set
    
    def perform_create(self,serializer):
        field_id = self.kwargs.get['field_id']
        field = Field.objects.get(pk=field_id)
        user = self.request.user

        #Agents only update their assigned fields
        if not user.is_admin() and field.assigned_agent !=user:
            raise PermissionDenied("You can only update your assigned fields")
        
        serializer.save(field=field)


class DashboardView(APIView):
    def get(self,request):
        user = request.user
        if user.is_admin():
            fields = Field.objects.all().select_related('assigned_agent')
        
        else:
            fields = Field.objects.filter(assigned_agent=user)

        statuses = [f.status for f in fields]
        active_count = statuses.count('active')
        at_risk_count = statuses.count('at_risk')
        completed_count = statuses.count('completed')

        stage_breakdown = {}
        for f in fields:
            stage_breakdown[f.current_stage] = stage_breakdown.get(f.current_stage,0)+1

            if user.is_admin():
                recent_updates = FieldUpdate.objects.all().select_related('agent','field')[:10]
            
            else:
                recent_updates = FieldUpdate.objects.filter(field__assigned_agent=user).select_related('agent','field')[:10]

            #per agent summary for admin
            agent_summary= []
            if user.is_admin():
                agents = UserModel.objects.filter(role='agents')
                agent_summary.append({
                    'agent_id': agent.id,
                    'agent_name': f"{agent.first_name} {agent.last_name}".strip() or agent.username,
                    'total':len(agent_fields),
                    'at_risk': sum(1 for f in agent_fields if f.status == 'at_risk'),

                })

            return Response({
                'total_fields': len(fields),
                'active_count':active_count,
                'at_risk_count':at_risk_count,
                'completed_count':completed_count,
                'stage_breakdown':stage_breakdown,
                'recent_updates':FieldUpdateSerializer(recent_updates,many=True).data,
                'agent_summary':agent_summary if user.is_admin() else []
            })
