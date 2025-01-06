import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import cors from "cors";
import helmet from "helmet";

import morgan from "morgan";

import * as dynamoose from "dynamoose";

import {clerkMiddleware, createClerkClient, requireAuth} from "@clerk/express";
import serverless from "serverless-http";

import seed from "./seed/seedDynamodb";


// ROUTE IMPORT
import courseRoute from "./routes/courseRoute";
import userClerkRoute from "./routes/clerkRoute";
import transactionRoute from "./routes/transactionRoute"
import userCourseProgressRoute from "./routes/userCourseProgressRoute";

// CONFIGURATIONS
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
})

if (!isProduction) {
  dynamoose.aws.ddb.local("http://localhost:8000");
} else {
  const ddb = new dynamoose.aws.ddb.DynamoDB({
    region: process.env.AWS_REGION || "us-east-2",
  });
W
  dynamoose.aws.ddb.set(ddb);
}

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(clerkMiddleware());

if (isProduction) {
  app.use(cors({
    origin: "https://master.d3rpgzidlvp4o7.amplifyapp.com",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
    credentials: true // If you're using cookies or authentication headers
  }));
  
}
else {
  app.use(cors());
}

// ROUTES
app.use("/courses", courseRoute);
app.use("/users/clerk", requireAuth(), userClerkRoute)
app.use("/transactions", requireAuth(), transactionRoute)
app.use("/users/course-progress", requireAuth(), userCourseProgressRoute)

app.get("/", (req, res) => {
  res.send("Hello World");
});

/* SERVER */
const port = process.env.PORT || 3000;

if (!isProduction) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// aws production environment
const serverlessApp = serverless(app);
export const handler = async (event: any, context: any) => {
  if (event.action === "seed") {
    await seed();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data seeded successfully" }),
    };
  } else {
    return serverlessApp(event, context);
  }
};
