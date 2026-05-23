# Arduino Integration Quick Start Guide

## 5-Minute Setup

### Step 1: Arduino Hardware Setup

**Wiring (Arduino UNO):**
```
GPS (NEO-6M):
  VCC → 5V
  GND → GND
  TX → RX (Pin 0)
  RX → TX (Pin 1)

GSM (SIM800L):
  VCC → 4.2V External Power
  GND → GND
  TX → Pin 2 (SoftwareSerial RX)
  RX → Pin 3 (SoftwareSerial TX)
```

### Step 2: Install Arduino Libraries

1. Open Arduino IDE
2. **Sketch → Include Library → Manage Libraries**
3. Search and install:
   - **TinyGPS++** (Mikal Hart)
   - **PubSubClient** (Nick O'Leary) - optional for MQTT

### Step 3: Configure Arduino Sketch

Edit `arduino/gps_gsm_mqtt.ino`:

```cpp
// Line 14: Your GSM APN (change for your carrier)
const char* apn = "ticlnet";  // tashicell
// const char* apn = "www";  // Jio
// const char* apn = "portalnmms";  // Vodafone

// Line 19-20: Backend Configuration
const char* backend_server = "YOUR_BACKEND_IP";  // e.g., 192.168.1.100
const char* vehicle_id = "VEHICLE_001";  // Your vehicle ID
```

### Step 4: Register Vehicle in Backend

```bash
curl -X POST http://localhost:3001/api/vehicles \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "VEHICLE_001",
    "make": "Toyota",
    "model": "Innova",
    "registration_time": "2024-01-01T00:00:00Z",
    "lat": 0,
    "lng": 0
  }'
```

**Or use the dashboard to add a vehicle.**

### Step 5: Upload to Arduino

1. Connect Arduino to USB
2. Select **Tools → Board → Arduino UNO**
3. Select **Tools → Port → COM#**
4. Click **Upload**

### Step 6: Verify Connection

Open **Tools → Serial Monitor** (9600 baud):

```
[SYSTEM] Arduino GPS-GSM-MQTT Bridge Starting...
[GSM] Initialization complete!
[GSM] ✓ Connected to Network
[GPRS] ✓ Connected
[GPS] Lat: 12.345678 | Lng: 76.543210 | Speed: 25.5 km/h | Sats: 12
[HTTP] ✓ Request successful to BACKEND
```

### Step 7: Check Backend

```bash
# Get latest location
curl http://localhost:3001/api/vehicle/VEHICLE_001/latest

# Response:
{
  "success": true,
  "data": {
    "latitude": 12.345678,
    "longitude": 76.543210,
    "speed": 25.5,
    "timestamp": "2024-05-13T10:30:45Z"
  }
}
```

### Step 8: View on Dashboard

Open frontend dashboard → Vehicle should appear on map with real-time location

---

## Carrier APN Settings

| Carrier | APN | Username | Password |
|---------|-----|----------|----------|
| Airtel | airtelgprs.com | (empty) | (empty) |
| Jio | www | (empty) | (empty) |
| Vodafone | portalnmms | (empty) | (empty) |
| BSNL | bsnlnet | (empty) | (empty) |

---

## Common Issues & Quick Fixes

### ❌ No Serial Output

- Check USB connection
- Select correct COM port
- Baud rate = 9600
- Try different USB cable

### ❌ GPS Not Getting Fix

- Wait 2-5 minutes (cold start)
- Place outside (clear sky view)
- Check antenna connection
- Ensure GPS RX/TX wiring correct

### ❌ GSM Not Registering

- Check SIM card is active
- Insert SIM and wait 10 seconds
- Verify correct APN for your carrier
- Check GSM power supply (4.2V minimum)

### ❌ HTTP Request Failed

- Ping backend from computer: `ping BACKEND_IP`
- Check backend running: `curl http://BACKEND_IP:3001/health`
- Verify vehicle exists in database
- Check firewall allows port 3001

### ❌ "Vehicle Not Found" Error

- Ensure vehicle_id in Arduino matches database
- Register vehicle first via API or dashboard
- Check database: `SELECT * FROM vehicles WHERE vehicle_id='VEHICLE_001';`

---

## Testing Without Real GPS/GSM

For development/testing:

```bash
# Send test location
curl -X POST http://localhost:3001/api/vehicle/location \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "VEHICLE_001",
    "lat": 12.345678,
    "lng": 76.543210,
    "alt": 50,
    "speed": 25.5,
    "sats": 12
  }'

# Send test status
curl -X POST http://localhost:3001/api/vehicle/status \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "VEHICLE_001",
    "status": "online",
    "signal": 20,
    "publish_count": 10
  }'
```

---

## Next Steps

1. **Real-time Dashboard:** WebSocket updates for live tracking
2. **Geofencing:** Alerts when vehicle enters/exits zones
3. **Route History:** View complete trip history
4. **Analytics:** Speed, distance, fuel consumption
5. **Mobile App:** Companion mobile application

---

## Files to Know

- **Arduino Sketch:** `arduino/gps_gsm_mqtt.ino`
- **Backend API:** `backend/src/routes/location.ts`
- **Location Service:** `backend/src/services/locationService.ts`
- **Full Docs:** `backend/ARDUINO_INTEGRATION.md`
- **Hardware Setup:** `arduino/README.md`

---

## Command Reference

```bash
# Create vehicle
POST /api/vehicles

# Send location (Arduino)
POST /api/vehicle/location

# Get latest location
GET /api/vehicle/:vehicleId/latest

# Get location history
GET /api/vehicle/:vehicleId/locations?limit=50

# Send status
POST /api/vehicle/status

# Get all vehicles
GET /api/vehicles

# Check backend health
GET /health
```

---

Need help? Check:
1. Arduino serial monitor output
2. Backend logs
3. [ARDUINO_INTEGRATION.md](ARDUINO_INTEGRATION.md) for detailed docs
4. [arduino/README.md](../arduino/README.md) for hardware setup

