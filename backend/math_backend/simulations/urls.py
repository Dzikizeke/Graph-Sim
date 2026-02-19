# simulations/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Basic CRUD operations
    path('simulations/', views.simulation_list, name='simulation-list'),
    path('simulations/<int:pk>/', views.simulation_detail, name='simulation-detail'),
    
    # Filtered lists
    path('simulations/type/<str:sim_type>/', views.simulation_by_type, name='simulation-by-type'),
    path('simulations/favorites/', views.favorite_simulations, name='favorite-simulations'),
    
    # Specialized save endpoints
    path('save/trigonometry/', views.save_trigonometry_config, name='save-trigonometry'),
    path('save/custom-function/', views.save_custom_function_config, name='save-custom-function'),
    
    # Actions
    path('simulations/<int:pk>/toggle-favorite/', views.toggle_favorite, name='toggle-favorite'),

    # ODE URLs
    path('api/save-ode-config/', views.save_ode_config, name='save_ode_config'),
    path('api/solve-ode/', views.solve_ode, name='solve_ode'),
    path('api/ode-solutions/<int:config_id>/', views.get_ode_solutions, name='get_ode_solutions'),
    path('api/ode-solution/<int:solution_id>/', views.get_ode_solution, name='get_ode_solution'),
    path('api/ode-solution/<int:solution_id>/delete/', views.delete_ode_solution, name='delete_ode_solution'),
    path('api/ode-methods/', views.get_ode_methods, name='get_ode_methods'),
]