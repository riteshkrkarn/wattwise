# API Documentation

Base URL: `/api/v1`

**Note for Postman:** Send data as **raw JSON**. Set header `Content-Type: application/json`.

## Users (Authentication & Profile)

### POST `/users/signup`
Registers a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "city": "Mumbai"
}
```

**Response (201):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "john@example.com",
      "city": "Mumbai",
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### POST `/users/login`
Authenticates a user and returns an access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "john@example.com",
      "city": "Mumbai"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged in successfully"
}
```

### POST `/users/logout`
Logs out the user (client should discard the token).

**Headers:**
- `Authorization`: `Bearer <accessToken>`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged out successfully"
}
```

### PATCH `/users/update-details`
Updates user profile information.

**Headers:**
- `Authorization`: `Bearer <accessToken>`

**Request Body:**
```json
{
  "name": "John Updated",
  "city": "Pune"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Updated",
    "email": "john@example.com",
    "city": "Pune"
  },
  "message": "Account details updated successfully"
}
```

### GET `/users/me`
Retrieves current authenticated user's details.

**Headers:**
- `Authorization`: `Bearer <accessToken>`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "User fetched successfully"
}
```

---

## Appliances

### POST `/appliances`
Adds a new appliance to the user's profile.

**Headers:**
- `Authorization`: `Bearer <accessToken>`

**Request Body:**
```json
{
  "category": "Living Room",
  "name": "LED TV",
  "wattage": 150,
  "count": 1,
  "defaultUsageHours": 4
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "654321...",
    "userId": "60d0fe4f5311236168a109ca",
    "name": "LED TV",
    "wattage": 150,
    "count": 1,
    "defaultUsageHours": 4
  },
  "message": "Appliance added successfully"
}
```

### GET `/appliances`
Fetches all appliances for the user.

**Headers:**
- `Authorization`: `Bearer <accessToken>`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "654321...",
      "name": "LED TV",
      "wattage": 150,
      "count": 1,
      "defaultUsageHours": 4
    }
  ],
  "message": "Appliances fetched successfully"
}
```

### DELETE `/appliances/:id`
Deletes an appliance by ID.

**Headers:**
- `Authorization`: `Bearer <accessToken>`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Appliance deleted successfully"
}
```

---

## Bills (Estimation & Comparison)

### GET `/bills/presets`
Returns a list of common appliance presets.

**Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    { "name": "Fan", "wattage": 75 },
    { "name": "AC", "wattage": 1500 }
  ],
  "message": "Presets fetched successfully"
}
```

### POST `/bills/estimate`
Estimates monthly electricity cost based on appliance usage.

**Request Body:**
```json
{
  "rate": 8,
  "appliances": [
    { "name": "Fan", "count": 2, "hours": 10, "watts": 75 },
    { "name": "AC", "count": 1, "hours": 8, "watts": 1500 }
  ]
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "totalUnits": 405, // kWh
    "totalCost": 3240,
    "breakdown": [
      { "name": "Fan", "estimatedUnits": 45, "estimatedCost": 360 },
      { "name": "AC", "estimatedUnits": 360, "estimatedCost": 2880 }
    ]
  },
  "message": "Bill estimated successfully"
}
```

### POST `/bills/compare`
Compares estimated cost with actual bill and normalizes values.

**Request Body:**
```json
{
  "actualBill": 3500,
  "estimatedData": {
    "totalCost": 3240,
    "breakdown": [
      { "name": "Fan", "estimatedCost": 360 },
      { "name": "AC", "estimatedCost": 2880 }
    ]
  }
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "discrepancy": 260,
    "discrepancyRatio": 1.08,
    "normalizedBreakdown": [
      { "name": "Fan", "estimatedCost": 360, "normalizedCost": 388.8 },
      { "name": "AC", "estimatedCost": 2880, "normalizedCost": 3110.4 }
    ]
  },
  "message": "Comparison complete"
}
```

### POST `/bills/save`
Saves a bill record (estimation + actual comparison) to history.

**Request Body:**
```json
{
  "userId": "60d0fe4f5311236168a109ca",
  "totalEstimatedUnits": 405,
  "totalEstimatedCost": 3240,
  "actualBillAmount": 3500,
  "discrepancyRatio": 1.08,
  "breakdown": [
    { 
      "name": "Fan", 
      "count": 2,
      "hours": 10,
      "watts": 75,
      "monthlyUnits": 45,
      "estimatedCost": 360,
      "normalizedCost": 388.8 
    }
  ]
}
```

**Response (201):**
```json
{

  "statusCode": 201,
  "data": {
     "_id": "7890...",
     "date": "2023-10-27T..."
  },
  "message": "Bill record saved successfully"
}
```

### GET `/bills/history?userId=<id>`
Fetches bill history for a user.

**Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "date": "2023-10-27T...",
      "totalEstimatedCost": 3240,
      "actualBillAmount": 3500
    }
  ],
  "message": "Bill history fetched successfully"
}
```

---

## AI Analysis

### POST `/ai/analyze`
Analyzes bill data using a Python agent to suggest savings and calculate carbon footprint.

**Request Body:**
```json
{
  "billData": {
    "breakdown": [
      { "name": "AC", "estimatedCost": 3110.4 },
      { "name": "Fan", "estimatedCost": 388.8 }
    ],
    "totalUnits": 405
  }
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "carbonFootprint": 344.25, // kg CO2
    "totalPotentialSavings": 311.04,
    "suggestions": [
      {
        "name": "AC",
        "suggestion": "Increase temperature by 2 degrees.",
        "reductionPercentage": 0.10,
        "savedAmount": 311.04
      }
    ]
  },
  "message": "AI Analysis (Agent) generated successfully"
}
```
