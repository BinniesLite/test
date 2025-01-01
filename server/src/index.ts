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

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(clerkMiddleware());

// ROUTES
app.use("/courses", courseRoute);
app.use("/users/clerk", requireAuth(), userClerkRoute)
app.use("/transactions", requireAuth(), transactionRoute)
app.use("/users/course-progress", requireAuth(), userCourseProgressRoute)

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
