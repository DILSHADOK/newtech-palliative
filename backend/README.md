# Backend for PalliativeCare+ Website

This folder contains a minimal Express/SQLite backend to support the frontend pages.

## Setup

```bash
cd backend
npm install
npm start
```

The server listens on port `3000` by default and also serves the frontend static files from `../frontend`.

## API Endpoints

- `GET /api/equipments` – return object of equipment-name ➜ quantity
- `POST /api/equipments` – `{name,qty}` add units (creates or increments)
- `PUT /api/equipments/:name` – `{qty}` set quantity explicitly

- `GET /api/orders` – list pending orders
- `POST /api/orders` – `{name,qty}` create order
- `DELETE /api/orders/:id` – remove order

- `GET /api/donations` – list donations (most recent first)
- `POST /api/donations` – `{name,email,amount,method}`

- `POST /api/patients` – register a patient

Data is stored in `backend/data.db` SQLite database. 

You can extend the API or integrate with a real database/payment gateway as needed.