from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_authenticated and request.user.is_admin()
    

class IsAdminOrReadOnly(BasePermission):
    #Admins can do anything while agents can only read & upddate their assigned fields
    def has_permissions(self,request,view):
        return request.user.is_authenticated
    
    def has_object_permission(self,request,view,obj):
        if request.user.is_admin():
            return True
        #Agents can only access fields assigned to them 
        return obj.assigned_agent == request.user