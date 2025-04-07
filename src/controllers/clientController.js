import Client from "../models/clientModel.js";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";
import { userCreatedEvent } from "../services/rabbitServices.js";

function generateRandomPassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Obtener todos los clientes
export const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error al listar clientes:", error);
    res.status(500).json({ message: "Error al listar clientes" });
  }
};

// Crear un nuevo cliente
export const createClient = async (req, res) => {
  const { name, lastName, birthDate, direction, mail, phone } = req.body;

  if (!name || !lastName || !birthDate || !direction || !mail || !phone) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  if (!isValidEmail(mail)) {
    return res.status(400).json({ message: "Correo no válido" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "El teléfono debe tener 10 dígitos" });
  }

  try {
    const existingClient = await Client.findOne({ where: { mail } });
    if (existingClient) {
      return res.status(400).json({ message: "El correo ya está registrado como cliente" });
    }

    const newClient = await Client.create({
      name,
      lastName,
      birthDate,
      direction,
      mail,
      phone,
      status: true,
      creationDate: new Date()
    });

    const existingUser = await User.findOne({ where: { username: mail } });
    if (!existingUser) {
      const defaultPassword = generateRandomPassword();
      const defaultRole = await Role.findOne({ where: { roleName: "client" } });

      if (!defaultRole) {
        return res.status(500).json({ message: "No se encontró el rol predeterminado 'client'" });
      }

      const newUser = await User.create({
        username: mail,
        phone,
        password: defaultPassword,
        roleId: defaultRole.id,
        status: true,
        creationDate: new Date()
      });

      await userCreatedEvent(newUser);
    }

    return res.status(201).json({ message: "Cliente y usuario creados correctamente", data: newClient });

  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

// Actualizar cliente
export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, lastName, birthDate, direction, mail, phone } = req.body;

  try {
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (mail) {
      function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      }
      if (!isValidEmail(mail)) {
        return res.status(400).json({ message: "Correo no válido" });
      }
      const existingClient = await Client.findOne({ where: { mail } });
      if (existingClient && existingClient.id !== parseInt(id)) {
        return res.status(400).json({ message: "El correo ya existe" });
      }
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "El teléfono debe tener 10 dígitos" });
    }

    await client.update({
      name: name || client.name,
      lastName: lastName || client.lastName,
      birthDate: birthDate || client.birthDate,
      direction: direction || client.direction,
      mail: mail || client.mail,
      phone: phone || client.phone
    });

    return res.status(200).json({ message: "Cliente actualizado correctamente", data: client });

  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

// Eliminar cliente (cambio de estado)
export const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    if (!client.status) {
      return res.status(400).json({ message: 'El cliente ya está eliminado' });
    }

    await client.update({ status: false });
    res.status(200).json({ message: 'Cliente eliminado correctamente' });

  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};
