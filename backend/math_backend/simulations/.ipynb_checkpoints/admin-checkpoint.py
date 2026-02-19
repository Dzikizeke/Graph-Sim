
# simulations/admin.py
from django.contrib import admin
from .models import SimulationConfiguration, SimulationFunction

@admin.register(SimulationConfiguration)
class SimulationConfigurationAdmin(admin.ModelAdmin):
    list_display = ('user', 'simulation_type', 'name', 'is_favorite', 'updated_at')
    list_filter = ('simulation_type', 'is_favorite', 'created_at')
    search_fields = ('user__username', 'name')

@admin.register(SimulationFunction)
class SimulationFunctionAdmin(admin.ModelAdmin):
    list_display = ('configuration', 'function_type', 'visible', 'order')
    list_filter = ('function_type', 'visible')