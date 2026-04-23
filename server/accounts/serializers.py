from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User 
        fields = ['id', 'username', 'email','first_name', 'last_name', 'role','phone']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password','first_name','last_name','role','phone']

        def create(self,validated_data):
            user = User.objects.create_user(
                username = validated_data['username'],
                email = validated_data.get['email',''],
                password = validated_data['password'],
                first_name = validated_data.get['first_name',''],
                last_name = validated_data.get['last_name',''],
                role = validated_data.get['role','agent'],
                phone = validated_data.get['phone','']
            )
            return user

# Custom serializer for JWT token to include user data
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data