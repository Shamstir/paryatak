from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F

from .models import Tourist, Itinerary, EmergencyContact, Location, Alert, PoliceUnit, Zone
from .serializers import (
    TouristSerializer, ItinerarySerializer, EmergencyContactSerializer,
    LocationSerializer, AlertSerializer, PoliceUnitSerializer, ZoneSerializer
)


class TouristViewSet(viewsets.ModelViewSet):
    queryset = Tourist.objects.all()
    serializer_class = TouristSerializer

    def get_queryset(self):
        # Optional: Add logic here to filter based on user permissions
        return super().get_queryset()

    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        Custom endpoint for tourist registration.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# This is a good way to handle endpoints that don't fit a standard CRUD pattern
class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer

    @action(detail=False, methods=['post'], url_path='panic-button')
    def panic(self, request):
        """
        Handles the panic button activation from the mobile app.
        """
        # This is where the core business logic happens.
        
        # 1. Validate incoming data (e.g., tourist ID, location)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Save the alert to the database
        alert = serializer.save(alert_type='Panic')
        
        # 3. Trigger immediate actions
        # For the Police Dashboard: Use a real-time message queue (like RabbitMQ)
        # to push the alert to the dashboard instantly.
        # This will be handled by the other backend developer.
        # For now, you can just return a success response.
        
        return Response({'status': 'Panic alert received'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='resolve')
    def resolve_alert(self, request, pk=None):
        """
        Allows an admin or police officer to resolve an alert.
        """
        alert = self.get_object()
        alert.status = 'Resolved'
        alert.save()
        serializer = self.get_serializer(alert)
        return Response(serializer.data)

# You'll create similar viewsets for other models
class ItineraryViewSet(viewsets.ModelViewSet):
    queryset = Itinerary.objects.all()
    serializer_class = ItinerarySerializer

class EmergencyContactViewSet(viewsets.ModelViewSet):
    queryset = EmergencyContact.objects.all()
    serializer_class = EmergencyContactSerializer
    
# You will need to import these views in your `urls.py` file to be accessible