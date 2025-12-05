"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const billRoutes_1 = __importDefault(require("./routes/billRoutes"));
const applianceRoutes_1 = __importDefault(require("./routes/applianceRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // Built-in body-parser
app.use(express_1.default.urlencoded({ extended: true })); // Handle URL-encoded data
app.use(require("cookie-parser")()); // Parse cookies
// Routes
app.use("/api/bills", billRoutes_1.default);
app.use("/api/appliances", applianceRoutes_1.default);
app.use("/api/ai", aiRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.get("/", (req, res) => {
    res.send("Byte Hackathon Backend is running!");
});
// Database Connection
if (MONGODB_URI) {
    mongoose_1.default
        .connect(MONGODB_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB connection error:", err));
}
else {
    console.log("MONGODB_URI not provided, running without DB");
}
// Global Error Handler
app.use(errorHandler_1.errorHandler);
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
