const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
const questionRoutes = require("./routes/questionRoutes");
app.use("/api/questions", questionRoutes);

const testRoutes = require("./routes/testRoutes");

app.use("/api/tests", testRoutes);
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/api/analytics", analyticsRoutes);
