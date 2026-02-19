# simulations/models.py
from django.db import models
from django.conf import settings

class SimulationConfiguration(models.Model):
    SIMULATION_TYPES = [
        ('trigonometry', 'Trigonometry'),
        ('custom_function', 'Custom Function'),
        ('ode', 'ODE Solver'),
        ('pde', 'PDE Solver'),
        ('calculus', 'Calculus'),
        ('statistics', 'Statistics'),
    ]
    ODE_TYPES = [
        ('first_order', 'First Order ODE'),
        ('second_order', 'Second Order ODE'),
        ('system', 'System of ODEs'),
    ]
    
    ODE_METHODS = [  # NEW: Complete list of ODE solving methods
        ('rk4', 'Runge-Kutta 4th Order'),
        ('rk45', 'Runge-Kutta-Fehlberg (RK45)'),
        ('dopri5', 'Dormand-Prince (DOPRI5)'),
        ('bdf', 'Backward Differentiation Formula (BDF)'),
        ('radau', 'Radau IIA (Implicit)'),
        ('euler', 'Euler Method'),
        ('midpoint', 'Midpoint Method'),
        ('heun', 'Heun Method'),
        ('rk23', 'Runge-Kutta 2nd/3rd Order'),
        ('lsoda', 'LSODA (Adaptive)'),
    ]
    
    # Use settings.AUTH_USER_MODEL instead of direct User reference
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    simulation_type = models.CharField(max_length=20, choices=SIMULATION_TYPES)
    ode_type = models.CharField(max_length=20, choices=ODE_TYPES, blank=True, null=True)
    ode_method = models.CharField(max_length=20, choices=ODE_METHODS, default='rk4', blank=True, null=True)
    name = models.CharField(max_length=100, default="My Configuration")
    config_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_favorite = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'simulation_type', 'name']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.simulation_type} - {self.name}"

    def get_simulation_data(self):
        """Get simulation-specific data based on type"""
        if self.simulation_type == 'trigonometry':
            return self.get_trigonometry_data()
        elif self.simulation_type == 'custom_function':
            return self.get_custom_function_data()
        elif self.simulation_type == 'ode':
            return self.get_ode_data()
        return self.config_data

    def get_trigonometry_data(self):
        """Extract trigonometry-specific data"""
        return {
            'x_min': self.config_data.get('x_min', -6.28),
            'x_max': self.config_data.get('x_max', 6.28),
            'points': self.config_data.get('points', 500),
            'functions': [
                {
                    'id': func.id,
                    'type': func.function_type,
                    'amplitude': func.amplitude,
                    'frequency': func.frequency,
                    'phase': func.phase,
                    'color': func.color,
                    'visible': func.visible
                }
                for func in self.functions.all()
            ]
        }

    def get_custom_function_data(self):
        """Extract custom function-specific data"""
        config_data = self.config_data
        # Handle both old and new field naming conventions
        x_min = config_data.get('x_min', config_data.get('x_range', {}).get('min', -5))
        x_max = config_data.get('x_max', config_data.get('x_range', {}).get('max', 5))
        y_min = config_data.get('y_min', config_data.get('y_range', {}).get('min', -5))
        y_max = config_data.get('y_max', config_data.get('y_range', {}).get('max', 5))
    
        return {
            'dimension': config_data.get('dimension', '3d'),
            'x_min': x_min,
            'x_max': x_max,
            'y_min': y_min,
            'y_max': y_max,
            'points': config_data.get('points', 30),
            'functions': [
                {
                    'id': func.id,
                    'expression': func.expression or '',
                    'type': func.function_type,
                    'color': func.color,
                    'visible': func.visible,
                    'parameters': func.parameters or {}
                }
                for func in self.functions.all()
            ]   
        }

    def get_ode_data(self):
        """Extract ODE-specific data"""
        config_data = self.config_data
        
        # Get the actual method chosen by user, fallback to config data, then to default
        user_method = self.ode_method or config_data.get('ode_settings', {}).get('method', 'rk4')
        
        return {
            'ode_type': self.ode_type,
            'ode_method': user_method,  # NEW: Include the actual method used
            'simulation_mode': config_data.get('simulation_mode', 'graphing'),
            'ode_settings': config_data.get('ode_settings', {
                'timeRange': {'min': 0, 'max': 10},
                'points': 1000,
                'method': user_method,  # FIXED: Use actual user method, not hardcoded
                'tolerance': 1e-6,
                'max_step': 0.1,
                'min_step': 1e-4,
            }),
            'first_order_odes': config_data.get('first_order_odes', []),
            'second_order_odes': config_data.get('second_order_odes', []),
            'system_odes': config_data.get('system_odes', {
                'numberOfEquations': 2,
                'physicalInterpretation': 'none',
                'equations': [],
                'initialConditions': {},
                'parameters': {}
            }),
            'simulation_params': config_data.get('simulation_params', {
                'animationSpeed': 1,
                'showTrajectory': True,
                'showVectorField': False,
                'realTimeParameters': {}
            }),
            'functions': [
                {
                    'id': func.id,
                    'equation': func.expression or '',
                    'type': func.function_type,
                    'color': func.color,
                    'visible': func.visible,
                    'parameters': func.parameters or {},
                    'variable_name': func.variable_name,
                    'initial_conditions': func.initial_conditions
                }
                for func in self.functions.all()
            ]
        }

class SimulationFunction(models.Model):
    FUNCTION_TYPES = [
        ('sin', 'Sine'),
        ('cos', 'Cosine'),
        ('tan', 'Tangent'),
        ('custom', 'Custom'),
        ('first_order_ode', 'First Order ODE'),
        ('second_order_ode', 'Second Order ODE'),
        ('system_ode', 'System ODE'),
    ]
    
    configuration = models.ForeignKey(
        SimulationConfiguration, 
        on_delete=models.CASCADE, 
        related_name='functions'
    )
    function_type = models.CharField(max_length=20, choices=FUNCTION_TYPES, default='sin')
    expression = models.TextField(blank=True, null=True)
    amplitude = models.FloatField(default=1.0)
    frequency = models.FloatField(default=1.0)
    phase = models.FloatField(default=0.0)
    color = models.CharField(max_length=7, default='#4f46e5')
    visible = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    parameters = models.JSONField(default=dict)

    # NEW fields for ODEs
    variable_name = models.CharField(max_length=10, blank=True, null=True)
    initial_conditions = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.function_type} - {self.configuration.name}"


class ODESolution(models.Model):
    SOLUTION_STATUS = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('error', 'Error'),
        ('timeout', 'Timeout'),
    ]
    
    configuration = models.ForeignKey(
        SimulationConfiguration,
        on_delete=models.CASCADE,
        related_name='ode_solutions'
    )
    solution_data = models.JSONField(default=dict)
    computed_at = models.DateTimeField(auto_now_add=True)
    computation_time = models.FloatField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=SOLUTION_STATUS, default='pending')
    method_used = models.CharField(max_length=20, choices=SimulationConfiguration.ODE_METHODS, default='rk4')
    
    class Meta:
        ordering = ['-computed_at']
    
    def __str__(self):
        return f"ODE Solution for {self.configuration.name} - {self.computed_at}"