import { 
  admins,
  servicePackages,
  customers,
  appointments,
  payments,
  smsNotifications,
  chatMessages,
  type Admin,
  type InsertAdmin,
  type ServicePackage,
  type InsertServicePackage,
  type Customer,
  type InsertCustomer,
  type Appointment,
  type InsertAppointment,
  type Payment,
  type InsertPayment,
  type SmsNotification,
  type InsertSmsNotification,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lte, and, sql, count } from "drizzle-orm";
import { hash, compare } from "bcryptjs";

export interface IStorage {
  // Admin operations
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  verifyAdmin(email: string, password: string): Promise<Admin | null>;
  
  // Service package operations
  getServicePackages(activeOnly?: boolean): Promise<ServicePackage[]>;
  getServicePackage(id: number): Promise<ServicePackage | undefined>;
  createServicePackage(package: InsertServicePackage): Promise<ServicePackage>;
  updateServicePackage(id: number, package: Partial<InsertServicePackage>): Promise<ServicePackage | undefined>;
  
  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Appointment operations
  getAppointments(filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    customerId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  getAvailableTimeSlots(date: Date, packageId: number): Promise<string[]>;
  
  // Payment operations
  getPayments(filters?: {
    status?: string;
    method?: string;
    appointmentId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // SMS operations
  createSmsNotification(sms: InsertSmsNotification): Promise<SmsNotification>;
  updateSmsStatus(id: number, status: string, sentAt?: Date): Promise<void>;
  
  // Chat operations
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Report operations
  getMonthlyReports(year: number, month: number): Promise<{
    totalAppointments: number;
    totalRevenue: number;
    completedAppointments: number;
    pendingAppointments: number;
    appointmentsByPackage: Array<{ packageName: string; count: number; revenue: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Admin operations
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const hashedPassword = await hash(adminData.password, 12);
    const [admin] = await db
      .insert(admins)
      .values({ ...adminData, password: hashedPassword })
      .returning();
    return admin;
  }

  async verifyAdmin(email: string, password: string): Promise<Admin | null> {
    const admin = await this.getAdminByEmail(email);
    if (!admin) return null;
    
    const isValid = await compare(password, admin.password);
    return isValid ? admin : null;
  }

  // Service package operations
  async getServicePackages(activeOnly = false): Promise<ServicePackage[]> {
    let query = db.select().from(servicePackages);
    if (activeOnly) {
      query = query.where(eq(servicePackages.isActive, true));
    }
    return await query.orderBy(servicePackages.name);
  }

  async getServicePackage(id: number): Promise<ServicePackage | undefined> {
    const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, id));
    return pkg;
  }

  async createServicePackage(packageData: InsertServicePackage): Promise<ServicePackage> {
    const [pkg] = await db.insert(servicePackages).values(packageData).returning();
    return pkg;
  }

  async updateServicePackage(id: number, packageData: Partial<InsertServicePackage>): Promise<ServicePackage | undefined> {
    const [pkg] = await db
      .update(servicePackages)
      .set(packageData)
      .where(eq(servicePackages.id, id))
      .returning();
    return pkg;
  }

  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(customerData).returning();
    return customer;
  }

  // Appointment operations
  async getAppointments(filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    customerId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Appointment[]> {
    let query = db
      .select()
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(servicePackages, eq(appointments.packageId, servicePackages.id));

    const conditions = [];
    if (filters?.status) conditions.push(eq(appointments.status, filters.status));
    if (filters?.dateFrom) conditions.push(gte(appointments.appointmentDate, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lte(appointments.appointmentDate, filters.dateTo));
    if (filters?.customerId) conditions.push(eq(appointments.customerId, filters.customerId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(appointments.appointmentDate));

    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.offset(filters.offset);

    const results = await query;
    return results.map(r => r.appointments);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(appointmentData).returning();
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...appointmentData, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async getAvailableTimeSlots(date: Date, packageId: number): Promise<string[]> {
    // Çalışma saatleri: 09:00 - 18:00
    const workingHours = [];
    for (let hour = 9; hour < 18; hour++) {
      workingHours.push(`${hour.toString().padStart(2, '0')}:00`);
      workingHours.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    // O günkü mevcut randevuları al
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay),
          eq(appointments.status, 'confirmed')
        )
      );

    const bookedSlots = existingAppointments.map(apt => {
      const time = new Date(apt.appointmentDate);
      return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    });

    return workingHours.filter(slot => !bookedSlots.includes(slot));
  }

  // Payment operations
  async getPayments(filters?: {
    status?: string;
    method?: string;
    appointmentId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Payment[]> {
    let query = db.select().from(payments);

    const conditions = [];
    if (filters?.status) conditions.push(eq(payments.paymentStatus, filters.status));
    if (filters?.method) conditions.push(eq(payments.paymentMethod, filters.method));
    if (filters?.appointmentId) conditions.push(eq(payments.appointmentId, filters.appointmentId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(payments.createdAt));

    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.offset(filters.offset);

    return await query;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(paymentData)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // SMS operations
  async createSmsNotification(smsData: InsertSmsNotification): Promise<SmsNotification> {
    const [sms] = await db.insert(smsNotifications).values(smsData).returning();
    return sms;
  }

  async updateSmsStatus(id: number, status: string, sentAt?: Date): Promise<void> {
    await db
      .update(smsNotifications)
      .set({ status, sentAt })
      .where(eq(smsNotifications.id, id));
  }

  // Chat operations
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }

  // Report operations
  async getMonthlyReports(year: number, month: number): Promise<{
    totalAppointments: number;
    totalRevenue: number;
    completedAppointments: number;
    pendingAppointments: number;
    appointmentsByPackage: Array<{ packageName: string; count: number; revenue: number }>;
  }> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    // Toplam randevu sayısı
    const [totalResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfMonth),
          lte(appointments.appointmentDate, endOfMonth)
        )
      );

    // Tamamlanan randevular
    const [completedResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfMonth),
          lte(appointments.appointmentDate, endOfMonth),
          eq(appointments.status, 'completed')
        )
      );

    // Bekleyen randevular
    const [pendingResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfMonth),
          lte(appointments.appointmentDate, endOfMonth),
          eq(appointments.status, 'pending')
        )
      );

    // Toplam gelir
    const [revenueResult] = await db
      .select({ total: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .leftJoin(appointments, eq(payments.appointmentId, appointments.id))
      .where(
        and(
          gte(appointments.appointmentDate, startOfMonth),
          lte(appointments.appointmentDate, endOfMonth),
          eq(payments.paymentStatus, 'completed')
        )
      );

    // Paket bazında istatistikler
    const packageStats = await db
      .select({
        packageName: servicePackages.name,
        count: count(),
        revenue: sql<number>`sum(${payments.amount})`
      })
      .from(appointments)
      .leftJoin(servicePackages, eq(appointments.packageId, servicePackages.id))
      .leftJoin(payments, eq(appointments.id, payments.appointmentId))
      .where(
        and(
          gte(appointments.appointmentDate, startOfMonth),
          lte(appointments.appointmentDate, endOfMonth),
          eq(payments.paymentStatus, 'completed')
        )
      )
      .groupBy(servicePackages.id, servicePackages.name);

    return {
      totalAppointments: totalResult.count,
      totalRevenue: revenueResult.total || 0,
      completedAppointments: completedResult.count,
      pendingAppointments: pendingResult.count,
      appointmentsByPackage: packageStats.map(stat => ({
        packageName: stat.packageName || 'Bilinmeyen Paket',
        count: stat.count,
        revenue: stat.revenue || 0
      }))
    };
  }
}

export const storage = new DatabaseStorage();