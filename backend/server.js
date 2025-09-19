const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../')); // Serve frontend files from parent directory

// Store reservations in memory (in production, use a database)
let reservations = [];
let reservationId = 1;

// Email transporter setup
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Routes
app.post('/api/reservations', async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, requests } = req.body;
    
    // Basic validation
    if (!name || !email || !date || !time || !guests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create reservation object
    const reservation = {
      id: reservationId++,
      name,
      email,
      phone: phone || 'Not provided',
      date,
      time,
      guests,
      requests: requests || 'None',
      createdAt: new Date().toISOString()
    };
    
    // Add to memory storage
    reservations.push(reservation);
    
    // Send confirmation email if email credentials are set up
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = createTransporter();
        
        // Email to customer
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Reservation Confirmation - Rakugaki',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d4af37;">Reservation Confirmed</h2>
              <p>Thank you for your reservation at Rakugaki. We're looking forward to serving you!</p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #d4af37;">
                <h3 style="color: #333; margin-top: 0;">Reservation Details:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Number of Guests:</strong> ${guests}</p>
                ${requests ? `<p><strong>Special Requests:</strong> ${requests}</p>` : ''}
              </div>
              
              <p>If you need to modify or cancel your reservation, please contact us at least 2 hours in advance.</p>
              
              <p>We look forward to serving you!</p>
              <p>The Rakugaki Team</p>
              <hr>
              <p style="color: #666; font-size: 12px;">
                Rakugaki Japanese Restaurant<br>
                123 Sakura Street, Tokyo<br>
                +81 3 1234 5678 | info@rakugaki.com
              </p>
            </div>
          `
        });
        
        // Email to restaurant
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: 'New Reservation - Rakugaki',
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="color: #d4af37;">New Reservation Received</h2>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                <h3 style="margin-top: 0;">Reservation Details:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Guests:</strong> ${guests}</p>
                <p><strong>Special Requests:</strong> ${requests || 'None'}</p>
                <p><strong>Reservation ID:</strong> ${reservation.id}</p>
                <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.status(201).json({ 
      message: 'Reservation created successfully', 
      reservationId: reservation.id,
      reservation 
    });
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reservations (for admin purposes)
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// Get a specific reservation
app.get('/api/reservations/:id', (req, res) => {
  const reservation = reservations.find(r => r.id === parseInt(req.params.id));
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  res.json(reservation);
});

// Basic admin interface
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rakugaki Admin</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 40px; 
          background-color: #0a0a0a;
          color: #f5f5f5;
        }
        h1 { 
          color: #d4af37; 
          border-bottom: 2px solid #d4af37;
          padding-bottom: 10px;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin-top: 20px;
          background-color: #1a1a1a;
        }
        th, td { 
          border: 1px solid #333; 
          padding: 12px; 
          text-align: left; 
        }
        th { 
          background-color: #2a2a2a; 
          color: #d4af37;
        }
        tr:nth-child(even) {
          background-color: #252525;
        }
        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
        .badge-success {
          background-color: #4caf50;
          color: white;
        }
      </style>
    </head>
    <body>
      <h1>Rakugaki Reservations</h1>
      <p>Total reservations: ${reservations.length}</p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Date</th>
            <th>Time</th>
            <th>Guests</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          ${reservations.map(r => `
            <tr>
              <td>${r.id}</td>
              <td>${r.name}</td>
              <td>${r.email}</td>
              <td>${new Date(r.date).toLocaleDateString()}</td>
              <td>${r.time}</td>
              <td>${r.guests}</td>
              <td>${new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `);
});

// Serve the main frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Serve the menu page
app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, '../menu.html'));
});

app.listen(PORT, () => {
  console.log(`Rakugaki backend server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
  console.log(`API: http://localhost:${PORT}/api/reservations`);
});