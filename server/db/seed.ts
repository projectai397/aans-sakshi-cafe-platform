/**
 * Database Seeding Script
 * Populates initial data for testing and development
 */

import { v4 as uuidv4 } from 'uuid';

// Mock database
const database = {
  users: [] as any[],
  locations: [] as any[],
  customers: [] as any[],
  menuItems: [] as any[],
  menuCategories: [] as any[],
  orders: [] as any[],
  staff: [] as any[],
  inventory: [] as any[],
};

/**
 * Seed users
 */
function seedUsers() {
  const users = [
    {
      id: uuidv4(),
      email: 'admin@sakshicafe.com',
      passwordHash: 'hashed_password', // In production, use bcrypt
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      email: 'manager@sakshicafe.com',
      passwordHash: 'hashed_password',
      name: 'Manager User',
      role: 'manager',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      email: 'staff@sakshicafe.com',
      passwordHash: 'hashed_password',
      name: 'Staff User',
      role: 'staff',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      email: 'customer@example.com',
      passwordHash: 'hashed_password',
      name: 'John Customer',
      role: 'customer',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  database.users = users;
  console.log(`✅ Seeded ${users.length} users`);
}

/**
 * Seed locations
 */
function seedLocations() {
  const locations = [
    {
      id: uuidv4(),
      name: 'Downtown Branch',
      address: '123 Main Street',
      city: 'Bangalore',
      postalCode: '560001',
      phone: '+91-80-1234-5678',
      latitude: '12.9716',
      longitude: '77.5946',
      openingTime: '09:00',
      closingTime: '23:00',
      capacity: 100,
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Airport Branch',
      address: '456 Airport Road',
      city: 'Bangalore',
      postalCode: '560017',
      phone: '+91-80-8765-4321',
      latitude: '13.1939',
      longitude: '77.7064',
      openingTime: '06:00',
      closingTime: '23:30',
      capacity: 150,
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Mall Branch',
      address: '789 Shopping Mall',
      city: 'Bangalore',
      postalCode: '560034',
      phone: '+91-80-5555-6666',
      latitude: '12.9352',
      longitude: '77.6245',
      openingTime: '10:00',
      closingTime: '22:00',
      capacity: 120,
      status: 'active',
      createdAt: new Date(),
    },
  ];

  database.locations = locations;
  console.log(`✅ Seeded ${locations.length} locations`);
}

/**
 * Seed menu categories
 */
function seedMenuCategories() {
  const categories = [
    { id: uuidv4(), name: 'Biryani', description: 'Fragrant rice dishes' },
    { id: uuidv4(), name: 'Curry', description: 'Spiced gravies and curries' },
    { id: uuidv4(), name: 'Bread', description: 'Breads and rotis' },
    { id: uuidv4(), name: 'Dessert', description: 'Sweet treats' },
    { id: uuidv4(), name: 'Beverages', description: 'Drinks and beverages' },
  ];

  database.menuCategories = categories;
  console.log(`✅ Seeded ${categories.length} menu categories`);
}

/**
 * Seed menu items
 */
function seedMenuItems() {
  const items = [
    {
      id: uuidv4(),
      locationId: database.locations[0].id,
      name: 'Hyderabadi Biryani',
      description: 'Traditional Hyderabadi biryani with basmati rice',
      categoryId: database.menuCategories[0].id,
      price: '350',
      cost: '120',
      isAvailable: true,
      preparationTime: 20,
      calories: 450,
      allergens: 'Contains nuts',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      locationId: database.locations[0].id,
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken',
      categoryId: database.menuCategories[1].id,
      price: '320',
      cost: '100',
      isAvailable: true,
      preparationTime: 18,
      calories: 380,
      allergens: 'Contains dairy',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      locationId: database.locations[0].id,
      name: 'Naan',
      description: 'Traditional Indian bread',
      categoryId: database.menuCategories[2].id,
      price: '50',
      cost: '15',
      isAvailable: true,
      preparationTime: 5,
      calories: 150,
      allergens: 'Contains wheat',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      locationId: database.locations[0].id,
      name: 'Gulab Jamun',
      description: 'Sweet milk solids in sugar syrup',
      categoryId: database.menuCategories[3].id,
      price: '80',
      cost: '25',
      isAvailable: true,
      preparationTime: 10,
      calories: 200,
      allergens: 'Contains dairy',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      locationId: database.locations[0].id,
      name: 'Mango Lassi',
      description: 'Refreshing yogurt drink with mango',
      categoryId: database.menuCategories[4].id,
      price: '80',
      cost: '20',
      isAvailable: true,
      preparationTime: 3,
      calories: 120,
      allergens: 'Contains dairy',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  database.menuItems = items;
  console.log(`✅ Seeded ${items.length} menu items`);
}

/**
 * Seed customers
 */
function seedCustomers() {
  const customers = [
    {
      id: uuidv4(),
      userId: database.users[3].id,
      phone: '+91-98765-43210',
      address: '123 Customer Street',
      city: 'Bangalore',
      postalCode: '560001',
      loyaltyPoints: 500,
      loyaltyTier: 'gold',
      totalSpent: '15000',
      orderCount: 25,
      lastOrderDate: new Date(),
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      userId: uuidv4(), // New user
      phone: '+91-98765-43211',
      address: '456 Another Street',
      city: 'Bangalore',
      postalCode: '560002',
      loyaltyPoints: 200,
      loyaltyTier: 'silver',
      totalSpent: '5000',
      orderCount: 10,
      lastOrderDate: new Date(),
      createdAt: new Date(),
    },
  ];

  database.customers = customers;
  console.log(`✅ Seeded ${customers.length} customers`);
}

/**
 * Seed orders
 */
function seedOrders() {
  const orders = [
    {
      id: uuidv4(),
      customerId: database.customers[0].id,
      locationId: database.locations[0].id,
      orderNumber: 'ORD-1001',
      totalAmount: '450',
      status: 'delivered',
      deliveryType: 'delivery',
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: uuidv4(),
      customerId: database.customers[0].id,
      locationId: database.locations[0].id,
      orderNumber: 'ORD-1002',
      totalAmount: '520',
      status: 'confirmed',
      deliveryType: 'delivery',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  database.orders = orders;
  console.log(`✅ Seeded ${orders.length} orders`);
}

/**
 * Seed staff
 */
function seedStaff() {
  const staff = [
    {
      id: uuidv4(),
      userId: database.users[2].id,
      locationId: database.locations[0].id,
      position: 'Chef',
      department: 'Kitchen',
      salary: '30000',
      joiningDate: '2024-01-15',
      status: 'active',
      performanceRating: '4.5',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      userId: uuidv4(),
      locationId: database.locations[0].id,
      position: 'Waiter',
      department: 'Service',
      salary: '15000',
      joiningDate: '2024-02-01',
      status: 'active',
      performanceRating: '4.2',
      createdAt: new Date(),
    },
  ];

  database.staff = staff;
  console.log(`✅ Seeded ${staff.length} staff members`);
}

/**
 * Seed inventory
 */
function seedInventory() {
  const inventory = database.menuItems.map((item) => ({
    id: uuidv4(),
    locationId: item.locationId,
    itemId: item.id,
    currentStock: Math.floor(Math.random() * 100) + 20,
    reorderPoint: 10,
    reorderQuantity: 50,
    unitCost: item.cost,
    lastUpdated: new Date(),
  }));

  database.inventory = inventory;
  console.log(`✅ Seeded ${inventory.length} inventory items`);
}

/**
 * Main seed function
 */
async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    seedUsers();
    seedLocations();
    seedMenuCategories();
    seedMenuItems();
    seedCustomers();
    seedOrders();
    seedStaff();
    seedInventory();

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Users: ${database.users.length}`);
    console.log(`   - Locations: ${database.locations.length}`);
    console.log(`   - Menu Items: ${database.menuItems.length}`);
    console.log(`   - Customers: ${database.customers.length}`);
    console.log(`   - Orders: ${database.orders.length}`);
    console.log(`   - Staff: ${database.staff.length}`);
    console.log(`   - Inventory: ${database.inventory.length}`);

    return database;
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed().catch(console.error);
}

export { seed, database };
