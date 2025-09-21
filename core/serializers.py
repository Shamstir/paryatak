from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Tourist, Itinerary, EmergencyContact, Location, Alert, PoliceUnit, Zone

class TouristSerializer(serializers.ModelSerializer):
    """
    Serializes the Tourist model for API consumption.
    Handles data for a tourist's digital ID and profile.
    """
    class Meta:
        model = Tourist
        fields = [
            'id', 'name', 'passport_aadhaar_id', 'phone_number',
            'email', 'zk_commitment', 'qr_band_token', 'is_active',
            'safety_score', 'created_at'
        ]
        read_only_fields = ['id', 'is_active', 'safety_score', 'created_at']

class ItinerarySerializer(serializers.ModelSerializer):
    """
    Serializes a tourist's travel itinerary.
    """
    class Meta:
        model = Itinerary
        fields = ['id', 'tourist', 'start_date', 'end_date', 'planned_route', 'is_active']
        read_only_fields = ['id', 'is_active']

class EmergencyContactSerializer(serializers.ModelSerializer):
    """
    Serializes the emergency contacts associated with a tourist.
    """
    class Meta:
        model = EmergencyContact
        fields = ['id', 'tourist', 'name', 'phone_number']
        read_only_fields = ['id', 'tourist']

class LocationSerializer(serializers.ModelSerializer):
    """
    Serializes a tourist's real-time location data.
    """
    class Meta:
        model = Location
        fields = ['id', 'tourist', 'location', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class AlertSerializer(serializers.ModelSerializer):
    """
    Serializes a safety alert or incident report.
    """
    class Meta:
        model = Alert
        fields = ['id', 'tourist', 'location', 'alert_type', 'status', 'timestamp', 'police_unit']
        read_only_fields = ['id', 'timestamp', 'status', 'police_unit']

class PoliceUnitSerializer(GeoFeatureModelSerializer):
    """
    Serializes PoliceUnit data, including its geographic location.
    """
    class Meta:
        model = PoliceUnit
        fields = ['id', 'name', 'contact_number']
        geo_field = 'location'

class ZoneSerializer(GeoFeatureModelSerializer):
    """
    Serializes Geo-Fenced Zone data with its boundary.
    """
    class Meta:
        model = Zone
        fields = ['id', 'name', 'risk_level', 'is_restricted']
        geo_field = 'boundary'