import Client from "../models/clientModel.js";
import User from "../models/userModel.js";
import { userCreatedEvent } from "../services/rabbitServices.js";

// Función para generar una contraseña aleatoria
function generateRandomPassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Obtiene todos los clientes
export const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error al listar clientes:", error);
    res.status(500).json({ message: "Error al listar clientes" });
  }
};

// Crea un nuevo cliente
export const createClient = async (req, res) => {
  const { name, lastName, birthDate, direction, mail, phone } = req.body;

  // Validación de campos obligatorios
  if (!name || !lastName || !birthDate || !direction || !mail || !phone) {
    return res.status(400).json({ message: "Todos los campos son obligatorios: name, lastName, birthDate, direction, mail, phone" });
  }

  // Función para validar correo electrónico
  function isValidEmail(email) {
    if (typeof email !== "string" || email.trim() === "") {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  if (!isValidEmail(mail)) {
    return res.status(400).json({ message: "Correo no válido" });
  }

  // Validación del teléfono (se espera que tenga 10 dígitos)
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "El teléfono debe tener 10 dígitos" });
  }

  try {
    // Verificar que el correo no exista ya (es único)
    const existingClient = await Client.findOne({ where: { mail } });
    if (existingClient) {
      return res.status(400).json({ message: "El correo ya existe" });
    }

    // Creación del cliente
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

    // Se usa el correo del cliente como username y el mismo teléfono para crear un usuario
    const existingUser = await User.findOne({ where: { username: mail } });
    if (!existingUser) {
      const defaultPassword = generateRandomPassword(10);
      const newUser = await User.create({
        username: mail,
        phone,
        password: defaultPassword,
        status: true,
        creationDate: new Date()
      });
      // Publicar el evento de usuario creado si se requiere lógica adicional
      await userCreatedEvent(newUser);
    }

    // Se puede agregar aquí un evento o lógica adicional si es necesario
    return res.status(201).json({ message: "Cliente creado correctamente", data: newClient });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

// Actualiza un cliente existente
export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, lastName, birthDate, direction, mail, phone } = req.body;

  try {
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Validar correo si se proporciona y verificar que no se duplique
    if (mail) {
      function isValidEmail(email) {
        if (typeof email !== "string" || email.trim() === "") {
          return false;
        }
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

    // Validar teléfono si se proporciona
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "El teléfono debe tener 10 dígitos" });
    }

    // Actualizar el cliente con los campos proporcionados o mantener los actuales
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
    return res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

// "Elimina" un cliente cambiando su status a false
export const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ message: 'No se ha encontrado el registro' });
    }

    if (!client.status) {
      return res.status(400).json({ message: 'El cliente ya ha sido eliminado' });
    }

    await client.update({
      status: false
    });

    res.status(200).json({ message: 'Cliente eliminado correctamente' });

  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};

