import express from 'express';
import cors from 'cors';
import Transaction from "./models/Transaction.js"; // Ensure `.js` extension
import insightsRoute from "./routes/insights.js";
import dotenv from "dotenv";
import mongoose from 'mongoose';

dotenv.config();
console.log("🔑 OpenRouter API Key:", process.env.OPENROUTER_API_KEY);

const app = express();

// Use CORS for allowing cross-origin requests
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Default to localhost for development

app.use(cors({
    origin: frontendUrl,
    credentials: true
}));


// Enable JSON body parsing for POST requests
app.use(express.json());

// Use the insights route to generate financial insights
app.use("/api/insights", insightsRoute);

// just for the purpose of testing
app.get("/api/test", (req, res) => {
    console.log(`Testing successful`);
    res.send({body: "Testing successful"});
});

// Connect to MongoDB once at the start
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);  // Exit the app if DB connection fails
    }
};

// Call the DB connection function
connectDB();

// Post a transaction to the database
app.post("/api/transaction", async (req, res) => {
    try {
        const { name, description, dateTime, price, category, type } = req.body;
        console.log("Received Data:", { name, description, dateTime, price, category, type });

        const transaction = await Transaction.create({ name, description, dateTime, price, category, type });
        console.log("Inserted Transaction:", transaction);

        res.json(transaction);
    } catch (err) {
        console.error("Database Insert Error:", err);
        res.status(500).json({ error: "Failed to insert transaction" });
    }
});

// Get all transactions from the database
app.get("/api/transaction", async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        console.error("Database Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

// Put request to update the registered transaction
app.put('/api/transaction/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, dateTime, category, type } = req.body;

    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            { name, description, price, dateTime, category, type },
            { new: true }
        );
        res.json(updatedTransaction);
    } catch (error) {
        res.status(500).json({ error: "Failed to update transaction" });
    }
});

// Delete a transaction
app.delete("/api/transaction/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Transaction.findByIdAndDelete(id);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete transaction" });
    }
});

// Listen for incoming requests
const PORT = process.env.PORT || 3001;  // Get port from environment or default to 3001

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});

