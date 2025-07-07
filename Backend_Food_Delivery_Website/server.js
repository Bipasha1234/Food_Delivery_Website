require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const socketio = require('./config/socketio'); 

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with the server
const io = socketio.init(server);
app.set('io', io);


connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api', require('./routes/getListedRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use("/api/menu", require('./routes/menuRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use("/api", require('./routes/locationRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinRoom', (id) => {
    if (id) {
      socket.join(id.toString());
      console.log(` Socket ${socket.id} joined room ${id}`);
    } else {
      console.warn(` joinRoom failed: Invalid ID`);
    }
  });

  




  socket.on('updateRestaurantStatus', ({ restaurantId, isOnline }) => {
    console.log(`Received status update for restaurant ${restaurantId}: ${isOnline}`);
    io.emit('restaurantStatusUpdate', { restaurantId, isOnline });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


const stripe = require('stripe')('sk_test_51RglMjQoydzmt3nR5JxpX0QO6WFbjD8aWjwdzXUpon6v1MC8wzoVaP2bXMXGgBBsqGz8zTIKRroGwQorWMJL887u001I8CgM8o'); // test key
app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  const parsedAmount = Math.round(Number(amount));

  if (!parsedAmount || isNaN(parsedAmount)) {
    return res.status(400).send({ error: "Invalid or missing payment amount." });
  }

  // Stripe minimum is 50 cents (~Rs. 67) => 6700 paisa
  if (parsedAmount < 70) {
    return res.status(400).send({ error: "Amount must be at least Rs. 70 to process payment." });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parsedAmount * 100, // 💥 Convert to paisa
      currency: "npr",
      payment_method_types: ["card"],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).send({ error: "Payment processing failed." });
  }
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
