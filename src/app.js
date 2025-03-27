//Configuración de express
import bodyParser from "body-parser";
import express from "express";
import clientsRoutes from "./routes/clientsRoutes.js";
import swaggerSpec from "./api-docs.js";
import swaggerUI from "swagger-ui-express";

const app = express();

app.use(bodyParser.json());
app.use("/app/clients", clientsRoutes);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

export default app;
