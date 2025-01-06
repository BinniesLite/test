"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.clerkClient = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dynamoose = __importStar(require("dynamoose"));
const express_2 = require("@clerk/express");
const serverless_http_1 = __importDefault(require("serverless-http"));
const seedDynamodb_1 = __importDefault(require("./seed/seedDynamodb"));
// ROUTE IMPORT
const courseRoute_1 = __importDefault(require("./routes/courseRoute"));
const clerkRoute_1 = __importDefault(require("./routes/clerkRoute"));
const transactionRoute_1 = __importDefault(require("./routes/transactionRoute"));
const userCourseProgressRoute_1 = __importDefault(require("./routes/userCourseProgressRoute"));
// CONFIGURATIONS
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
exports.clerkClient = (0, express_2.createClerkClient)({
    secretKey: process.env.CLERK_SECRET_KEY
});
if (!isProduction) {
    dynamoose.aws.ddb.local("http://localhost:8000");
}
else {
    // AWS.config.update({
    //   accessKeyId: process.env.AWS_ACCESS_KEY,
    //   secretAccessKey: process.env.AWS_SECRET_KEY,
    //   region: process.env.AWS_REGION,
    // });
    // Production DynamoDB configuration
    // if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_ACCESS_KEY) {
    //   throw new Error("AWS credentials are not configured");
    // }
    // Using the DynamoDB client configuration
    const ddb = new dynamoose.aws.ddb.DynamoDB({
        region: process.env.AWS_REGION || "us-east-2",
    });
    dynamoose.aws.ddb.set(ddb);
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, express_2.clerkMiddleware)());
if (isProduction) {
    app.use((0, cors_1.default)({
        origin: "https://master.d3rpgzidlvp4o7.amplifyapp.com",
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
        credentials: true // If you're using cookies or authentication headers
    }));
}
else {
    app.use((0, cors_1.default)());
}
// ROUTES
app.use("/courses", courseRoute_1.default);
app.use("/users/clerk", (0, express_2.requireAuth)(), clerkRoute_1.default);
app.use("/transactions", (0, express_2.requireAuth)(), transactionRoute_1.default);
app.use("/users/course-progress", (0, express_2.requireAuth)(), userCourseProgressRoute_1.default);
// app.get("/", (req, res) => {
//   res.send("Hello World");
// });
/* SERVER */
const port = process.env.PORT || 3000;
if (!isProduction) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
// aws production environment
const serverlessApp = (0, serverless_http_1.default)(app);
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.action === "seed") {
        yield (0, seedDynamodb_1.default)();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data seeded successfully" }),
        };
    }
    else {
        return serverlessApp(event, context);
    }
});
exports.handler = handler;
