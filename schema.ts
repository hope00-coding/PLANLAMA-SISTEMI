import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin kullanıcı tablosu
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hizmet paketleri tablosu
export const servicePackages = pgTable("service_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // dakika cinsinden
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Müşteriler tablosu
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Randevular tablosu
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  packageId: integer("package_id").references(() => servicePackages.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, confirmed, cancelled, completed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ödemeler tablosu
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // bank_transfer, eft, paytr
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("pending"), // pending, completed, failed, refunded
  transactionId: varchar("transaction_id", { length: 255 }),
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SMS bildirimleri tablosu
export const smsNotifications = pgTable("sms_notifications", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, sent, failed
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat mesajları tablosu (müşteri desteği için)
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  message: text("message").notNull(),
  isFromUser: boolean("is_from_user").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemaları ve type'lar
export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertSmsNotificationSchema = createInsertSchema(smsNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Type exports
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;
export type ServicePackage = typeof servicePackages.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertSmsNotification = z.infer<typeof insertSmsNotificationSchema>;
export type SmsNotification = typeof smsNotifications.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
