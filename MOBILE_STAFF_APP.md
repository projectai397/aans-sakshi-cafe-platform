# Mobile Staff App - Complete Implementation Guide

## Overview

The Mobile Staff App provides comprehensive staff management capabilities including shift scheduling, attendance tracking, real-time notifications, and performance analytics. Designed for both iOS and Android (React Native), it enables staff to manage their schedules, track attendance, and monitor performance from anywhere.

---

## Architecture

### Components

1. **MobileStaffAppService** - Core business logic
2. **MobileStaffAppRoutes** - REST API endpoints
3. **React Native Client** - Mobile app implementation

### Data Flow

```
Mobile App (Staff)
       ↓
REST API / WebSocket
       ↓
MobileStaffAppService
       ↓
Database
       ↓
Notifications & Analytics
```

---

## Installation & Setup

### 1. Environment Variables

```bash
# Mobile Staff App Configuration
STAFF_APP_ENABLED=true
STAFF_APP_NOTIFICATION_ENABLED=true
STAFF_APP_GEOLOCATION_ENABLED=true
STAFF_APP_SHIFT_REMINDER_HOURS=2
```

### 2. Database Schema

```sql
CREATE TABLE staff_members (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  position VARCHAR(100),
  department VARCHAR(100),
  locationId VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
  joinDate DATE,
  profileImage VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (locationId) REFERENCES locations(id),
  INDEX idx_locationId (locationId),
  INDEX idx_status (status)
);

CREATE TABLE shifts (
  id VARCHAR(255) PRIMARY KEY,
  employeeId VARCHAR(255) NOT NULL,
  locationId VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  type ENUM('morning', 'afternoon', 'evening', 'night'),
  status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES staff_members(id),
  FOREIGN KEY (locationId) REFERENCES locations(id),
  INDEX idx_employeeId (employeeId),
  INDEX idx_date (date),
  INDEX idx_status (status)
);

CREATE TABLE attendance (
  id VARCHAR(255) PRIMARY KEY,
  employeeId VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'half_day', 'leave') DEFAULT 'present',
  checkInTime TIMESTAMP,
  checkOutTime TIMESTAMP,
  checkInLat DECIMAL(10, 8),
  checkInLng DECIMAL(11, 8),
  checkOutLat DECIMAL(10, 8),
  checkOutLng DECIMAL(11, 8),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES staff_members(id),
  UNIQUE KEY unique_employee_date (employeeId, date),
  INDEX idx_employeeId (employeeId),
  INDEX idx_date (date)
);

CREATE TABLE staff_notifications (
  id VARCHAR(255) PRIMARY KEY,
  employeeId VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  data JSON,
  read BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES staff_members(id),
  INDEX idx_employeeId (employeeId),
  INDEX idx_read (read)
);

CREATE TABLE performance_metrics (
  id VARCHAR(255) PRIMARY KEY,
  employeeId VARCHAR(255) NOT NULL UNIQUE,
  totalShifts INT DEFAULT 0,
  completedShifts INT DEFAULT 0,
  cancelledShifts INT DEFAULT 0,
  noShowShifts INT DEFAULT 0,
  attendanceRate DECIMAL(5, 2) DEFAULT 0,
  onTimeRate DECIMAL(5, 2) DEFAULT 0,
  averageRating DECIMAL(3, 2) DEFAULT 0,
  totalHours DECIMAL(10, 2) DEFAULT 0,
  overtimeHours DECIMAL(10, 2) DEFAULT 0,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES staff_members(id),
  INDEX idx_employeeId (employeeId)
);

CREATE TABLE shift_swap_requests (
  id VARCHAR(255) PRIMARY KEY,
  shiftId VARCHAR(255) NOT NULL,
  requestingEmployeeId VARCHAR(255) NOT NULL,
  targetEmployeeId VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  respondedAt TIMESTAMP,
  FOREIGN KEY (shiftId) REFERENCES shifts(id),
  FOREIGN KEY (requestingEmployeeId) REFERENCES staff_members(id),
  FOREIGN KEY (targetEmployeeId) REFERENCES staff_members(id),
  INDEX idx_status (status),
  INDEX idx_targetEmployeeId (targetEmployeeId)
);
```

---

## API Endpoints

### Staff Management

#### Create Staff Member
```bash
POST /api/staff/create
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "position": "Chef",
  "department": "Kitchen",
  "locationId": "loc_001"
}
```

Response:
```json
{
  "success": true,
  "staff": {
    "id": "STAFF-1699564800-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "position": "Chef",
    "department": "Kitchen",
    "locationId": "loc_001",
    "status": "active",
    "joinDate": "2024-11-10T13:00:00Z"
  }
}
```

#### Get Staff Member
```bash
GET /api/staff/{employeeId}
```

#### Get Location Staff
```bash
GET /api/location/{locationId}/staff
```

Response:
```json
{
  "locationId": "loc_001",
  "count": 25,
  "staff": [...]
}
```

#### Update Staff Member
```bash
PUT /api/staff/{employeeId}
Content-Type: application/json

{
  "position": "Senior Chef",
  "status": "active"
}
```

### Shift Management

#### Create Shift
```bash
POST /api/shift/create
Content-Type: application/json

{
  "employeeId": "STAFF-123",
  "locationId": "loc_001",
  "date": "2024-11-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "type": "morning"
}
```

Response:
```json
{
  "success": true,
  "shift": {
    "id": "SHIFT-1699564800-def456",
    "employeeId": "STAFF-123",
    "date": "2024-11-15",
    "startTime": "09:00",
    "endTime": "17:00",
    "type": "morning",
    "status": "scheduled"
  }
}
```

#### Get Employee Shifts
```bash
GET /api/staff/{employeeId}/shifts?days=30
```

Response:
```json
{
  "employeeId": "STAFF-123",
  "count": 12,
  "shifts": [...]
}
```

#### Get Upcoming Shifts
```bash
GET /api/staff/{employeeId}/upcoming-shifts?days=7
```

#### Get Location Shifts
```bash
GET /api/location/{locationId}/shifts?date=2024-11-15
```

#### Update Shift Status
```bash
PUT /api/shift/{shiftId}/status
Content-Type: application/json

{
  "status": "completed"
}
```

### Shift Swap Management

#### Request Shift Swap
```bash
POST /api/shift-swap/request
Content-Type: application/json

{
  "shiftId": "SHIFT-123",
  "requestingEmployeeId": "STAFF-123",
  "targetEmployeeId": "STAFF-456"
}
```

Response:
```json
{
  "success": true,
  "swapRequest": {
    "id": "SWAP-1699564800-ghi789",
    "shiftId": "SHIFT-123",
    "requestingEmployeeId": "STAFF-123",
    "targetEmployeeId": "STAFF-456",
    "status": "pending",
    "createdAt": "2024-11-10T13:00:00Z"
  }
}
```

#### Approve Shift Swap
```bash
POST /api/shift-swap/{swapRequestId}/approve
```

#### Reject Shift Swap
```bash
POST /api/shift-swap/{swapRequestId}/reject
```

#### Get Pending Swap Requests
```bash
GET /api/staff/{employeeId}/pending-swaps
```

### Attendance Tracking

#### Check In
```bash
POST /api/attendance/check-in
Content-Type: application/json

{
  "employeeId": "STAFF-123",
  "latitude": 28.6139,
  "longitude": 77.209
}
```

Response:
```json
{
  "success": true,
  "attendance": {
    "id": "ATT-1699564800-jkl012",
    "employeeId": "STAFF-123",
    "date": "2024-11-10",
    "status": "present",
    "checkInTime": "2024-11-10T09:05:00Z",
    "checkInLocation": {
      "lat": 28.6139,
      "lng": 77.209
    }
  }
}
```

#### Check Out
```bash
POST /api/attendance/check-out
Content-Type: application/json

{
  "employeeId": "STAFF-123",
  "latitude": 28.6139,
  "longitude": 77.209
}
```

#### Get Today's Attendance
```bash
GET /api/attendance/{employeeId}/today
```

#### Get Attendance History
```bash
GET /api/attendance/{employeeId}/history?days=30
```

### Notifications

#### Send Notification
```bash
POST /api/notification/send
Content-Type: application/json

{
  "employeeId": "STAFF-123",
  "type": "shift_reminder",
  "title": "Shift Reminder",
  "message": "Your shift starts in 2 hours",
  "data": {
    "shiftId": "SHIFT-123"
  }
}
```

#### Get Notifications
```bash
GET /api/notifications/{employeeId}?unreadOnly=false
```

Response:
```json
{
  "employeeId": "STAFF-123",
  "count": 5,
  "notifications": [
    {
      "id": "NOTIF-123",
      "type": "shift_reminder",
      "title": "Shift Reminder",
      "message": "Your shift starts in 2 hours",
      "read": false,
      "createdAt": "2024-11-10T07:00:00Z"
    }
  ]
}
```

#### Mark Notification as Read
```bash
PUT /api/notification/{notificationId}/read
```

### Performance Metrics

#### Get Employee Performance
```bash
GET /api/performance/{employeeId}
```

Response:
```json
{
  "employeeId": "STAFF-123",
  "totalShifts": 45,
  "completedShifts": 44,
  "cancelledShifts": 1,
  "noShowShifts": 0,
  "attendanceRate": 97.8,
  "onTimeRate": 95.5,
  "averageRating": 4.7,
  "totalHours": 352,
  "overtimeHours": 12,
  "lastUpdated": "2024-11-10T13:00:00Z"
}
```

#### Get Team Performance
```bash
GET /api/location/{locationId}/team-performance
```

### Dashboard

#### Get Dashboard Data
```bash
GET /api/dashboard/{employeeId}
```

Response:
```json
{
  "staff": {
    "id": "STAFF-123",
    "name": "John Doe",
    "position": "Chef"
  },
  "upcomingShifts": [
    {
      "id": "SHIFT-123",
      "date": "2024-11-15",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ],
  "todayAttendance": {
    "status": "present",
    "checkInTime": "2024-11-10T09:05:00Z"
  },
  "unreadNotifications": 2,
  "performance": {
    "attendanceRate": 97.8,
    "onTimeRate": 95.5,
    "averageRating": 4.7
  }
}
```

### Payroll

#### Get Payroll Information
```bash
GET /api/payroll/{employeeId}/{month}
```

Example: `/api/payroll/STAFF-123/2024-11`

Response:
```json
{
  "employeeId": "STAFF-123",
  "month": "2024-11",
  "totalShifts": 20,
  "totalHours": 160,
  "overtimeHours": 8,
  "baseSalary": 20000,
  "allowances": {
    "dearness": 2000,
    "transport": 1000
  },
  "deductions": {
    "provident_fund": 1800,
    "tax": 2500
  },
  "grossSalary": 23000,
  "netSalary": 18700
}
```

---

## React Native Implementation

### Installation

```bash
npx react-native init SakshiStaffApp
cd SakshiStaffApp
npm install axios react-native-geolocation-service react-native-push-notification
```

### Example Components

#### Dashboard Screen

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';

export default function DashboardScreen({ employeeId }) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`/api/dashboard/${employeeId}`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome, {dashboard.staff.name}</Text>
        <Text style={styles.subtitle}>{dashboard.staff.position}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Status</Text>
        <Text style={styles.status}>
          {dashboard.todayAttendance?.status === 'present'
            ? `Checked in at ${new Date(dashboard.todayAttendance.checkInTime).toLocaleTimeString()}`
            : 'Not checked in'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Shifts</Text>
        {dashboard.upcomingShifts.map((shift: any) => (
          <Text key={shift.id} style={styles.shiftText}>
            {shift.date}: {shift.startTime} - {shift.endTime}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance</Text>
        <Text>Attendance: {dashboard.performance.attendanceRate}%</Text>
        <Text>On-Time: {dashboard.performance.onTimeRate}%</Text>
        <Text>Rating: {dashboard.performance.averageRating}/5</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    color: '#4CAF50',
  },
  shiftText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
});
```

#### Attendance Screen

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

export default function AttendanceScreen({ employeeId }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      await axios.post('/api/attendance/check-in', {
        employeeId,
        latitude,
        longitude,
      });

      setCheckedIn(true);
      alert('Checked in successfully!');
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      await axios.post('/api/attendance/check-out', {
        employeeId,
        latitude,
        longitude,
      });

      setCheckedIn(false);
      alert('Checked out successfully!');
    } catch (error) {
      console.error('Check-out error:', error);
      alert('Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.status}>
          {checkedIn ? 'You are checked in' : 'You are checked out'}
        </Text>

        <TouchableOpacity
          style={[styles.button, checkedIn ? styles.checkOutButton : styles.checkInButton]}
          onPress={checkedIn ? handleCheckOut : handleCheckIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : checkedIn ? 'Check Out' : 'Check In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  checkOutButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## Features

### 1. Shift Management
- View upcoming shifts
- Request shift swaps
- Receive shift reminders
- Track shift history

### 2. Attendance Tracking
- Check-in/check-out with geolocation
- View attendance history
- Monthly attendance report
- Geofencing support

### 3. Notifications
- Shift reminders (2 hours before)
- Shift change notifications
- Performance alerts
- Payroll notifications
- Real-time push notifications

### 4. Performance Dashboard
- Attendance rate
- On-time rate
- Average rating
- Total hours worked
- Overtime tracking

### 5. Payroll Information
- Monthly payroll summary
- Shift-based calculation
- Allowances & deductions
- Net salary calculation

---

## Best Practices

1. **Geolocation**: Request permission before accessing location
2. **Notifications**: Use push notifications for time-sensitive updates
3. **Offline Support**: Cache data for offline access
4. **Battery**: Optimize location tracking to reduce battery drain
5. **Security**: Implement token-based authentication

---

## Troubleshooting

### Geolocation Not Working
- Check location permissions in app settings
- Ensure GPS is enabled on device
- Verify location accuracy threshold

### Notifications Not Received
- Check notification permissions
- Verify FCM/APNS configuration
- Check notification service status

### Performance Issues
- Implement pagination for large lists
- Cache frequently accessed data
- Optimize API calls

---

## Conclusion

The Mobile Staff App provides a comprehensive solution for staff management, enabling efficient shift scheduling, attendance tracking, and performance monitoring. With real-time notifications and intuitive mobile interface, it improves staff engagement and operational efficiency.
