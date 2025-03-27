import express from "express";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

const router = express.Router(); 

router.get("/all", getClients);
/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestión de clientes
 * /app/clients/all:
 *   get:
 *     summary: Obtiene todos los clientes
 *     tags: [Clients]
 *     responses:
 *       '200':
 *         description: Respuesta exitosa
 */

router.post("/create", createClient);
/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestión de clientes
 * /app/clients/create:
 *   post:
 *     summary: Crea un nuevo cliente
 *     tags: [Clients]
 *     responses:
 *       '200':
 *         description: Cliente creado exitosamente
 */

router.patch("/update/:id", updateClient);
/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestión de clientes
 * /app/clients/update/{id}:
 *   patch:
 *     summary: Actualiza un cliente
 *     tags: [Clients]
 *     responses:
 *       '200':
 *         description: Cliente actualizado exitosamente
 */

router.delete("/delete/:id", deleteClient);
/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestión de clientes
 * /app/clients/delete/{id}:
 *   delete:
 *     summary: Elimina un cliente
 *     tags: [Clients]
 *     responses:
 *       '200':
 *         description: Cliente eliminado exitosamente
 */

export default router;
