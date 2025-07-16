import type { Express } from "express";
import { createServer, type Server } from "http";
import { 
  insertAdminSchema,
  insertServicePackageSchema,
  insertCustomerSchema,
  insertAppointmentSchema,
  insertPaymentSchema,
  insertSmsNotificationSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Admin routes
  app.post("/api/admin/register", async (req, res) => {
    try {
      const adminData = insertAdminSchema.parse(req.body);
      const admin = await storage.createAdmin(adminData);
      res.status(201).json({ id: admin.id, email: admin.email, name: admin.name });
    } catch (error) {
      res.status(400).json({ message: "Admin oluşturma başarısız" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await storage.verifyAdmin(email, password);
      if (admin) {
        res.json({ id: admin.id, email: admin.email, name: admin.name });
      } else {
        res.status(401).json({ message: "Geçersiz email veya şifre" });
      }
    } catch (error) {
      res.status(500).json({ message: "Giriş işlemi başarısız" });
    }
  });

  // Service package routes
  app.get("/api/packages", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const packages = await storage.getServicePackages(activeOnly);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Paketler yüklenemedi" });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pkg = await storage.getServicePackage(id);
      if (pkg) {
        res.json(pkg);
      } else {
        res.status(404).json({ message: "Paket bulunamadı" });
      }
    } catch (error) {
      res.status(500).json({ message: "Paket yüklenemedi" });
    }
  });

  app.post("/api/packages", async (req, res) => {
    try {
      const packageData = insertServicePackageSchema.parse(req.body);
      const pkg = await storage.createServicePackage(packageData);
      res.status(201).json(pkg);
    } catch (error) {
      res.status(400).json({ message: "Paket oluşturma başarısız" });
    }
  });

  app.put("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const packageData = insertServicePackageSchema.partial().parse(req.body);
      const pkg = await storage.updateServicePackage(id, packageData);
      if (pkg) {
        res.json(pkg);
      } else {
        res.status(404).json({ message: "Paket bulunamadı" });
      }
    } catch (error) {
      res.status(400).json({ message: "Paket güncelleme başarısız" });
    }
  });

  // Customer routes
  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      // Check if customer already exists
      const existingCustomer = await storage.getCustomerByEmail(customerData.email);
      if (existingCustomer) {
        res.json(existingCustomer);
      } else {
        const customer = await storage.createCustomer(customerData);
        res.status(201).json(customer);
      }
    } catch (error) {
      res.status(400).json({ message: "Müşteri kaydı başarısız" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (customer) {
        res.json(customer);
      } else {
        res.status(404).json({ message: "Müşteri bulunamadı" });
      }
    } catch (error) {
      res.status(500).json({ message: "Müşteri yüklenemedi" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const {
        status,
        dateFrom,
        dateTo,
        customerId,
        limit = "50",
        offset = "0"
      } = req.query;

      const filters = {
        status: status as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        customerId: customerId ? parseInt(customerId as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const appointments = await storage.getAppointments(filters);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Randevular yüklenemedi" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (appointment) {
        res.json(appointment);
      } else {
        res.status(404).json({ message: "Randevu bulunamadı" });
      }
    } catch (error) {
      res.status(500).json({ message: "Randevu yüklenemedi" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      
      // SMS bildirimi oluştur
      const customer = await storage.getCustomer(appointmentData.customerId!);
      const pkg = await storage.getServicePackage(appointmentData.packageId!);
      
      if (customer && pkg) {
        const smsMessage = `Merhaba ${customer.firstName}! ${pkg.name} için randevunuz ${new Date(appointmentData.appointmentDate).toLocaleDateString('tr-TR')} tarihinde oluşturuldu. Teşekkürler!`;
        
        await storage.createSmsNotification({
          appointmentId: appointment.id,
          phoneNumber: customer.phone,
          message: smsMessage
        });
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Randevu oluşturma başarısız" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, appointmentData);
      if (appointment) {
        res.json(appointment);
      } else {
        res.status(404).json({ message: "Randevu bulunamadı" });
      }
    } catch (error) {
      res.status(400).json({ message: "Randevu güncelleme başarısız" });
    }
  });

  // Available time slots
  app.get("/api/appointments/available-slots", async (req, res) => {
    try {
      const { date, packageId } = req.query;
      if (!date || !packageId) {
        return res.status(400).json({ message: "Tarih ve paket ID gerekli" });
      }
      
      const slots = await storage.getAvailableTimeSlots(
        new Date(date as string),
        parseInt(packageId as string)
      );
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Uygun saatler yüklenemedi" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const {
        status,
        method,
        appointmentId,
        limit = "50",
        offset = "0"
      } = req.query;

      const filters = {
        status: status as string,
        method: method as string,
        appointmentId: appointmentId ? parseInt(appointmentId as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const payments = await storage.getPayments(filters);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Ödemeler yüklenemedi" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Ödeme kaydı başarısız" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paymentData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(id, paymentData);
      if (payment) {
        res.json(payment);
      } else {
        res.status(404).json({ message: "Ödeme bulunamadı" });
      }
    } catch (error) {
      res.status(400).json({ message: "Ödeme güncelleme başarısız" });
    }
  });

  // Chat routes
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Mesajlar yüklenemedi" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Mesaj gönderme başarısız" });
    }
  });

  // Reports routes
  app.get("/api/reports/monthly", async (req, res) => {
    try {
      const { year, month } = req.query;
      if (!year || !month) {
        return res.status(400).json({ message: "Yıl ve ay parametreleri gerekli" });
      }
      
      const report = await storage.getMonthlyReports(
        parseInt(year as string),
        parseInt(month as string)
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Rapor oluşturulamadı" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}