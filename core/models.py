from django.db import models
from django.contrib.gis.db import models as gis_models

class Tourist(models.Model):
    name = models.CharField(max_length=255)
    passport_aadhaar_id = models.CharField(max_length=255, unique=True)
    phone_number = models.CharField(max_length=15, unique=True)
    email = models.EmailField(blank=True, null=True)
    # The zk_commitment from the Blockchain guy
    zk_commitment = models.CharField(max_length=255, unique=True)
    qr_band_token = models.CharField(max_length=255, unique=True, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    safety_score = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class PoliceUnit(gis_models.Model):
    name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    # Use PointField for geospatial data
    location = gis_models.PointField(srid=4326)

    def __str__(self):
        return self.name