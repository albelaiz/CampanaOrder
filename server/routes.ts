import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { upload, handleUploadError } from "./upload";
import { z } from "zod";
import { insertOrderSchema, insertOrderItemSchema, insertMenuItemSchema, insertTableSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload route
  app.post('/api/upload', upload.single('image'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Return the file URL
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  }, handleUploadError);

  // Public routes - no authentication required
  
  // Get menu items
  app.get('/api/menu', async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ message: "Failed to fetch menu" });
    }
  });

  // Get menu categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getMenuCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get table by number (for QR code scanning)
  app.get('/api/tables/:number', async (req, res) => {
    try {
      const tableNumber = parseInt(req.params.number);
      if (isNaN(tableNumber)) {
        return res.status(400).json({ message: "Invalid table number" });
      }
      
      const table = await storage.getTableByNumber(tableNumber);
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      res.json(table);
    } catch (error) {
      console.error("Error fetching table:", error);
      res.status(500).json({ message: "Failed to fetch table" });
    }
  });

  // Set table number in session
  app.post('/api/session/table', async (req, res) => {
    try {
      const { tableNumber } = req.body;
      
      if (!tableNumber || isNaN(parseInt(tableNumber))) {
        return res.status(400).json({ message: "Invalid table number" });
      }

      // Validate table exists
      const table = await storage.getTableByNumber(parseInt(tableNumber));
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }

      // Store in session (if using express-session)
      if (req.session) {
        req.session.tableNumber = parseInt(tableNumber);
      }

      res.json({ success: true, tableNumber: parseInt(tableNumber) });
    } catch (error) {
      console.error("Error setting table number:", error);
      res.status(500).json({ message: "Failed to set table number" });
    }
  });

  // Create order (public - no auth required for customers)
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = req.body;
      console.log('Received order data:', JSON.stringify(orderData, null, 2));
      
      // Validate order data
      const orderSchema = insertOrderSchema.extend({
        items: z.array(insertOrderItemSchema),
        tableNumber: z.number().optional() // Allow table number in request body
      });
      
      const validatedData = orderSchema.parse(orderData);
      console.log('Validated order data:', JSON.stringify(validatedData, null, 2));
      
      // Determine table ID - check request body first, then session
      let tableId = validatedData.tableId;
      let tableNumber = validatedData.tableNumber;
      
      // If tableNumber is provided but not tableId, look up the table
      if (tableNumber && !tableId) {
        const table = await storage.getTableByNumber(tableNumber);
        if (table) {
          tableId = table.id;
        }
      }
      
      // Fall back to session table number if available
      if (!tableId && req.session && req.session.tableNumber) {
        const table = await storage.getTableByNumber(req.session.tableNumber);
        if (table) {
          tableId = table.id;
        }
      }
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      const order = await storage.createOrder(
        {
          ...validatedData,
          orderNumber,
          tableId, // Ensure table is linked
        },
        validatedData.items
      );
      
      // Broadcast new order to staff via WebSocket
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'NEW_ORDER',
            data: order
          }));
        }
      });
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get order by number (for tracking)
  app.get('/api/orders/:orderNumber', async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Staff routes (now public for demo purposes)
  app.get('/api/staff/orders', async (req, res) => {
    try {
      const status = req.query.status as string;
      const orders = status 
        ? await storage.getOrdersByStatus(status)
        : await storage.getOrders();
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Update order status (now public for demo purposes)
  app.patch('/api/staff/orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(req.params.id, status);
      
      // Broadcast status update via WebSocket
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'ORDER_STATUS_UPDATE',
            data: { orderId: req.params.id, status }
          }));
        }
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Admin routes (now public for demo purposes)
  app.get('/api/admin/analytics', async (req, res) => {
    try {
      const [revenue, orderCount, popularItems] = await Promise.all([
        storage.getTodaysRevenue(),
        storage.getTodaysOrderCount(),
        storage.getPopularItems()
      ]);
      
      res.json({
        todaysRevenue: revenue,
        todaysOrderCount: orderCount,
        popularItems
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Menu management (now public for demo purposes)
  app.post('/api/admin/menu-items', async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(validatedData);
      
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.patch('/api/admin/menu-items/:id', async (req, res) => {
    try {
      const updatedItem = await storage.updateMenuItem(req.params.id, req.body);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete('/api/admin/menu-items/:id', async (req, res) => {
    try {
      await storage.deleteMenuItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Table management (now public for demo purposes)
  app.get('/api/admin/tables', async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  app.post('/api/admin/tables', async (req, res) => {
    try {
      const tableData = insertTableSchema.parse(req.body);
      const newTable = await storage.createTable(tableData);
      res.status(201).json(newTable);
    } catch (error) {
      console.error("Error creating table:", error);
      res.status(500).json({ message: "Failed to create table" });
    }
  });

  app.patch('/api/admin/tables/:id', async (req, res) => {
    try {
      const updatedTable = await storage.updateTable(req.params.id, req.body);
      res.json(updatedTable);
    } catch (error) {
      console.error("Error updating table:", error);
      res.status(500).json({ message: "Failed to update table" });
    }
  });

  app.delete('/api/admin/tables/:id', async (req, res) => {
    try {
      await storage.deleteTable(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting table:", error);
      res.status(500).json({ message: "Failed to delete table" });
    }
  });

  // Bulk create tables (useful for initial setup)
  app.post('/api/admin/tables/bulk', async (req, res) => {
    try {
      const { count } = req.body;
      if (!count || count < 1 || count > 100) {
        return res.status(400).json({ message: "Count must be between 1 and 100" });
      }

      const tables = [];
      for (let i = 1; i <= count; i++) {
        const qrCode = `${req.protocol}://${req.get('host')}/?table=${i}`;
        const table = await storage.createTable({
          number: i,
          qrCode,
          isActive: true
        });
        tables.push(table);
      }

      res.status(201).json(tables);
    } catch (error) {
      console.error("Error creating tables:", error);
      res.status(500).json({ message: "Failed to create tables" });
    }
  });

  // Generate QR code data URL for printing
  app.get('/api/admin/tables/:id/qr', async (req, res) => {
    try {
      const table = await storage.getTable(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }

      // Return QR data that frontend can use to generate actual QR codes
      res.json({
        tableNumber: table.number,
        qrUrl: table.qrCode,
        printData: {
          title: `La Campana Restaurant - Table ${table.number}`,
          subtitle: "Scan to order",
          url: table.qrCode
        }
      });
    } catch (error) {
      console.error("Error generating QR data:", error);
      res.status(500).json({ message: "Failed to generate QR data" });
    }
  });

  app.post('/api/admin/tables', async (req, res) => {
    try {
      const validatedData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(validatedData);
      
      res.status(201).json(table);
    } catch (error) {
      console.error("Error creating table:", error);
      res.status(500).json({ message: "Failed to create table" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle different message types if needed
        switch (data.type) {
          case 'PING':
            ws.send(JSON.stringify({ type: 'PONG' }));
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
