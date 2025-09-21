from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TouristViewSet, AlertViewSet, ItineraryViewSet, EmergencyContactViewSet

router = DefaultRouter()
router.register(r'tourists', TouristViewSet, basename='tourist')
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'itineraries', ItineraryViewSet, basename='itinerary')
router.register(r'emergency_contacts', EmergencyContactViewSet, basename='emergency-contact')

urlpatterns = [
    path('', include(router.urls)),
]