# simulations/serializers.py
from rest_framework import serializers
from .models import SimulationConfiguration, SimulationFunction

class SimulationFunctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationFunction
        fields = '__all__'
        read_only_fields = ('id', 'configuration')

class SimulationConfigurationSerializer(serializers.ModelSerializer):
    functions = SimulationFunctionSerializer(many=True, read_only=True)
    
    class Meta:
        model = SimulationConfiguration
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

class SimulationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationConfiguration
        fields = ('simulation_type', 'name', 'config_data')
    
    def create(self, validated_data):
        # Add the current user from the request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class SimulationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationConfiguration
        fields = ('name', 'config_data', 'is_favorite')

# Specialized serializers for different simulation types
class TrigonometryConfigSerializer(serializers.Serializer):
    
    name = serializers.CharField(max_length=100, required=False, default='Trigonometry Configuration')
    x_min = serializers.FloatField(default=-6.28)
    x_max = serializers.FloatField(default=6.28)
    points = serializers.IntegerField(default=500)
    functions = serializers.ListField(child=serializers.DictField(), default=list)

class CustomFunctionConfigSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100, required=False, default='Custom Function Configuration')
    dimension = serializers.ChoiceField(choices=['2d', '3d'], default='3d')
    x_min = serializers.FloatField(default=-5, required=False)
    x_max = serializers.FloatField(default=5, required=False)
    y_min = serializers.FloatField(default=-5, required=False)
    y_max = serializers.FloatField(default=5, required=False)
    points = serializers.IntegerField(default=30)
    functions = serializers.ListField(child=serializers.DictField(), default=list)

    def validate(self, data):
        # Ensure we have valid x and y ranges
        if 'x_min' not in data:
            data['x_min'] = -5
        if 'x_max' not in data:
            data['x_max'] = 5
        if 'y_min' not in data:
            data['y_min'] = -5
        if 'y_max' not in data:
            data['y_max'] = 5
            
        # Validate that min < max
        if data['x_min'] >= data['x_max']:
            raise serializers.ValidationError("x_min must be less than x_max")
        if data['y_min'] >= data['y_max']:
            raise serializers.ValidationError("y_min must be less than y_max")
            
        return data


# NEW: ODE Serializers
class ODEConfigSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100, required=False, default='ODE Configuration')
    section = serializers.ChoiceField(choices=[
        ('firstorder', 'First Order ODE'),
        ('secondorder', 'Second Order ODE'), 
        ('systems', 'System of ODEs')
    ], default='firstorder')
    simulationMode = serializers.ChoiceField(choices=[
        ('graphing', 'Graphing'),
        ('simulation', 'Simulation')
    ], default='graphing')
    odeSettings = serializers.DictField(default=dict)
    firstOrderOdes = serializers.ListField(child=serializers.DictField(), default=list)
    secondOrderOdes = serializers.ListField(child=serializers.DictField(), default=list)
    systemOdes = serializers.DictField(default=dict)
    simulationParams = serializers.DictField(default=dict)

    def validate_odeSettings(self, value):
        """Validate ODE settings"""
        default_settings = {
            'timeRange': {'min': 0, 'max': 10},
            'points': 1000,
            'method': 'rk4',
            'tolerance': 1e-6,
            'max_step': 0.1,
            'min_step': 1e-4,
        }
        
        # Merge with defaults
        for key, default_val in default_settings.items():
            if key not in value:
                value[key] = default_val
        
        # Validate time range
        time_range = value.get('timeRange', {})
        if time_range.get('min', 0) >= time_range.get('max', 10):
            raise serializers.ValidationError("Time start must be less than time end")
        
        # Validate points
        points = value.get('points', 1000)
        if points < 10 or points > 10000:
            raise serializers.ValidationError("Points must be between 10 and 10000")
        
        # Validate method
        valid_methods = [method[0] for method in SimulationConfiguration.ODE_METHODS]
        if value.get('method') not in valid_methods:
            raise serializers.ValidationError(f"Method must be one of: {', '.join(valid_methods)}")
        
        return value

    def validate_firstOrderOdes(self, value):
        """Validate first order ODEs"""
        for ode in value:
            if not ode.get('expression'):
                raise serializers.ValidationError("First order ODE must have an expression")
            if 'initialCondition' not in ode:
                raise serializers.ValidationError("First order ODE must have initial condition")
        return value

    def validate_secondOrderOdes(self, value):
        """Validate second order ODEs"""
        for ode in value:
            if not ode.get('expression'):
                raise serializers.ValidationError("Second order ODE must have an expression")
            if 'initialConditions' not in ode:
                raise serializers.ValidationError("Second order ODE must have initial conditions")
        return value

    def validate_systemOdes(self, value):
        """Validate system of ODEs"""
        equations = value.get('equations', [])
        if len(equations) < 2:
            raise serializers.ValidationError("System must have at least 2 equations")
        
        for eq in equations:
            if not eq.get('expression'):
                raise serializers.ValidationError("System equation must have an expression")
            if not eq.get('variable'):
                raise serializers.ValidationError("System equation must have a variable name")
        
        return value