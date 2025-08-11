import {
  users,
  tables,
  menuCategories,
  menuItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Table,
  type InsertTable,
  type MenuCategory,
  type InsertMenuCategory,
  type MenuItem,
  type InsertMenuItem,
  type MenuItemWithCategory,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Table operations
  getTables(): Promise<Table[]>;
  getTable(id: string): Promise<Table | undefined>;
  getTableByNumber(number: number): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: string, table: Partial<InsertTable>): Promise<Table>;
  deleteTable(id: string): Promise<void>;

  // Menu operations
  getMenuCategories(): Promise<MenuCategory[]>;
  createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  updateMenuCategory(id: string, category: Partial<InsertMenuCategory>): Promise<MenuCategory>;
  deleteMenuCategory(id: string): Promise<void>;

  getMenuItems(): Promise<MenuItemWithCategory[]>;
  getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;

  // Order operations
  getOrders(): Promise<OrderWithItems[]>;
  getOrdersByStatus(status: string): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  getOrderByNumber(orderNumber: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  
  // Analytics
  getTodaysRevenue(): Promise<number>;
  getTodaysOrderCount(): Promise<number>;
  getPopularItems(): Promise<{ item: MenuItem; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Table operations
  async getTables(): Promise<Table[]> {
    return await db.select().from(tables).where(eq(tables.isActive, true));
  }

  async getTable(id: string): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table;
  }

  async getTableByNumber(number: number): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(
      and(eq(tables.number, number), eq(tables.isActive, true))
    );
    return table;
  }

  async createTable(table: InsertTable): Promise<Table> {
    const [newTable] = await db.insert(tables).values(table).returning();
    return newTable;
  }

  async updateTable(id: string, table: Partial<InsertTable>): Promise<Table> {
    const [updatedTable] = await db
      .update(tables)
      .set(table)
      .where(eq(tables.id, id))
      .returning();
    return updatedTable;
  }

  async deleteTable(id: string): Promise<void> {
    await db.update(tables).set({ isActive: false }).where(eq(tables.id, id));
  }

  // Menu operations
  async getMenuCategories(): Promise<MenuCategory[]> {
    return await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.isActive, true))
      .orderBy(menuCategories.displayOrder);
  }

  async createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const [newCategory] = await db
      .insert(menuCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateMenuCategory(id: string, category: Partial<InsertMenuCategory>): Promise<MenuCategory> {
    const [updatedCategory] = await db
      .update(menuCategories)
      .set(category)
      .where(eq(menuCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteMenuCategory(id: string): Promise<void> {
    await db.update(menuCategories).set({ isActive: false }).where(eq(menuCategories.id, id));
  }

  async getMenuItems(): Promise<MenuItemWithCategory[]> {
    return await db
      .select()
      .from(menuItems)
      .leftJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .where(and(eq(menuItems.isActive, true), eq(menuItems.isAvailable, true)))
      .then(results => 
        results.map(row => ({
          ...row.menu_items,
          category: row.menu_categories!
        }))
      );
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .where(
        and(
          eq(menuItems.categoryId, categoryId),
          eq(menuItems.isActive, true),
          eq(menuItems.isAvailable, true)
        )
      );
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updatedItem] = await db
      .update(menuItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.update(menuItems).set({ isActive: false }).where(eq(menuItems.id, id));
  }

  // Order operations
  async getOrders(): Promise<OrderWithItems[]> {
    const ordersData = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .leftJoin(users, eq(orders.customerId, users.id))
      .orderBy(desc(orders.createdAt));

    const orderIds = ordersData.map(row => row.orders.id);
    
    if (orderIds.length === 0) return [];
    
    const orderItemsData = await db
      .select()
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(inArray(orderItems.orderId, orderIds));

    return ordersData.map(row => ({
      ...row.orders,
      table: row.tables || undefined,
      customer: row.users || undefined,
      orderItems: orderItemsData
        .filter(item => item.order_items.orderId === row.orders.id)
        .map(item => ({
          ...item.order_items,
          menuItem: item.menu_items!
        }))
    }));
  }

  async getOrdersByStatus(status: string): Promise<OrderWithItems[]> {
    const ordersData = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .leftJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.status, status as any))
      .orderBy(desc(orders.createdAt));

    const orderIds = ordersData.map(row => row.orders.id);
    
    if (orderIds.length === 0) return [];
    
    const orderItemsData = await db
      .select()
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(inArray(orderItems.orderId, orderIds));

    return ordersData.map(row => ({
      ...row.orders,
      table: row.tables || undefined,
      customer: row.users || undefined,
      orderItems: orderItemsData
        .filter(item => item.order_items.orderId === row.orders.id)
        .map(item => ({
          ...item.order_items,
          menuItem: item.menu_items!
        }))
    }));
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const [orderData] = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .leftJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.id, id));

    if (!orderData) return undefined;

    const orderItemsData = await db
      .select()
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...orderData.orders,
      table: orderData.tables || undefined,
      customer: orderData.users || undefined,
      orderItems: orderItemsData.map(item => ({
        ...item.order_items,
        menuItem: item.menu_items!
      }))
    };
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | undefined> {
    const [orderData] = await db
      .select()
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .leftJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.orderNumber, orderNumber));

    if (!orderData) return undefined;

    const orderItemsData = await db
      .select()
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, orderData.orders.id));

    return {
      ...orderData.orders,
      table: orderData.tables || undefined,
      customer: orderData.users || undefined,
      orderItems: orderItemsData.map(item => ({
        ...item.order_items,
        menuItem: item.menu_items!
      }))
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id
    }));
    
    const newOrderItems = await db
      .insert(orderItems)
      .values(orderItemsWithOrderId)
      .returning();

    const menuItemIds = items.map(item => item.menuItemId).filter(Boolean) as string[];
    const menuItemsData = await db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, menuItemIds));

    return {
      ...newOrder,
      orderItems: newOrderItems.map(item => ({
        ...item,
        menuItem: menuItemsData.find(mi => mi.id === item.menuItemId)!
      }))
    };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Analytics
  async getTodaysRevenue(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(
        and(
          sql`${orders.createdAt} >= ${today}`,
          sql`${orders.status} != 'cancelled'`
        )
      );
    
    return Number(result[0]?.total || 0);
  }

  async getTodaysOrderCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(
        and(
          sql`${orders.createdAt} >= ${today}`,
          sql`${orders.status} != 'cancelled'`
        )
      );
    
    return Number(result[0]?.count || 0);
  }

  async getPopularItems(): Promise<{ item: MenuItem; count: number }[]> {
    const result = await db
      .select({
        menuItem: menuItems,
        count: sql<number>`SUM(${orderItems.quantity})`
      })
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(sql`${orders.createdAt} >= CURRENT_DATE - INTERVAL '7 days'`)
      .groupBy(menuItems.id)
      .orderBy(desc(sql`SUM(${orderItems.quantity})`))
      .limit(5);

    return result.map(row => ({
      item: row.menuItem!,
      count: Number(row.count)
    }));
  }
}

export const storage = new DatabaseStorage();
