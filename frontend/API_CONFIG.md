# Frontend Configuration for Render Backend

This guide shows how to update your HTML files to connect to your Render backend.

## Quick Update

Replace all API calls from local to your Render backend URL.

### Option 1: Direct URL (Simplest)
In each HTML file, add this at the top of your `<script>` section:

```javascript
const API_BASE_URL = 'https://palliative-backend.onrender.com';
```

Then update all fetch calls:
```javascript
// Before
fetch('http://localhost:3000/api/equipments')

// After
fetch(`${API_BASE_URL}/api/equipments`)
```

### Option 2: Environment-Based (Recommended for Multiple Environments)
Add this to detect environment:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://palliative-backend.onrender.com';
```

This way:
- Local development works without changes
- Production uses Render URL automatically

## Example Updates

### Before (Local Only)
```javascript
async function getEquipments() {
  const response = await fetch('http://localhost:3000/api/equipments');
  return response.json();
}
```

### After (Works Anywhere)
```javascript
const API_BASE_URL = 'https://palliative-backend.onrender.com';

async function getEquipments() {
  const response = await fetch(`${API_BASE_URL}/api/equipments`);
  return response.json();
}
```

## Common API Endpoints

```javascript
// GET equipment list
GET ${API_BASE_URL}/api/equipments

// POST new equipment
POST ${API_BASE_URL}/api/equipments
Body: { name: "Wheelchair", qty: 5 }

// GET all orders
GET ${API_BASE_URL}/api/orders

// POST new order
POST ${API_BASE_URL}/api/orders
Body: { name: "IV Drip", qty: 2 }

// GET all donations
GET ${API_BASE_URL}/api/donations

// POST new donation
POST ${API_BASE_URL}/api/donations
Body: { name: "John", email: "john@email.com", amount: 100, method: "credit_card" }

// GET all patients
GET ${API_BASE_URL}/api/patients

// POST new patient
POST ${API_BASE_URL}/api/patients
Body: { name: "Patient Name", age: 65, condition: "Cancer", address: "123 Main St", priority: "high" }

// GET dashboard stats
GET ${API_BASE_URL}/api/stats
```

## Files That Need Updates

Review these files and update any hardcoded localhost URLs:
- index.html
- admin.html
- deliver.html (probably - if it has API calls)
- donate.html
- equipment.html
- register_patient.html
- Volunteer.html

## Testing

Once deployed to Vercel, test the connection:
```javascript
// Open browser console and run:
fetch('https://palliative-backend.onrender.com/api/stats')
  .then(r => r.json())
  .then(d => console.log('Connected!', d))
  .catch(e => console.error('Connection failed:', e))
```

## Verify Backend is Running

If getting errors, check:
1. Backend URL is correct
2. Copy exact URL from Render dashboard
3. Backend service is not in "Suspended" state (free tier spins down)
4. Try accessing: `https://palliative-backend.onrender.com/api/stats` directly

---
Once all HTML files are updated and pushed, Vercel will auto-deploy your frontend!
