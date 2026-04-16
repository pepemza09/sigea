from rest_framework import serializers
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from .models import ConfiguracionGeneral


class UserSerializer(serializers.ModelSerializer):
    groups_list = serializers.SerializerMethodField()
    is_active_display = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_active_display', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'groups_list'
        ]
        read_only_fields = ['date_joined', 'last_login']
    
    def get_groups_list(self, obj):
        return [{'id': g.id, 'name': g.name} for g in obj.groups.all()]
    
    def get_is_active_display(self, obj):
        return 'Activo' if obj.is_active else 'Inactivo'


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    groups = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'is_active', 'is_staff', 'groups'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        groups = validated_data.pop('groups', [])
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        user.groups.set(groups)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        if groups is not None:
            instance.groups.set(groups)
        
        instance.save()
        return instance


class GroupSerializer(serializers.ModelSerializer):
    permissions_list = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions_list', 'user_count']
    
    def get_permissions_list(self, obj):
        return [{'id': p.id, 'name': p.name, 'codename': p.codename} for p in obj.permissions.all()]
    
    def get_user_count(self, obj):
        return obj.user_set.count()


class PermissionSerializer(serializers.ModelSerializer):
    content_type_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type_name']
    
    def get_content_type_name(self, obj):
        return obj.content_type.name if obj.content_type else None


class ConfiguracionGeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionGeneral
        fields = ['id', 'clave', 'valor', 'descripcion', 'es_sensible', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.es_sensible and instance.valor and instance.valor.startswith('***'):
            data['valor'] = '********'
        return data


class BackupSerializer(serializers.Serializer):
    tipo = serializers.ChoiceField(choices=['completo', 'unidades', 'carreras', 'planes', 'materias', 'equivalencias'])
    formato = serializers.ChoiceField(choices=['json', 'csv'], default='json')


class AppInfoSerializer(serializers.Serializer):
    nombre = serializers.CharField()
    version = serializers.CharField()
    entorno = serializers.CharField()
    python_version = serializers.CharField()
    django_version = serializers.CharField()
