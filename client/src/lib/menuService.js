// Menu Service - Parse CSV and manage menu data
// Simulate daily stock limits
const DAILY_STOCK_LIMITS = {
  'Vada Pav': 50,
  'Samosa': 40,
  'Samosa Chaat': 30,
  'Masala Dosa': 25,
  'Uttappa': 20,
  'Aloo Paratha': 35,
  'Poha': 45,
  'Tea': 100,
  'Medu Vada': 15,
  'Coffee': 80,
  'Idli': 40,
  'Upma': 30
};

let currentOrders = [];
let menuCache = [];

// Load menu items from CSV file
export async function loadMenuFromCSV() {
  if (menuCache.length > 0) return menuCache;

  try {
    const response = await fetch('/data/canteen_orders.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n');

    // Skip header row
    const dataLines = lines.slice(1).filter(line => line.trim());

    // Parse CSV and extract unique food items
    const foodItemCounts = {};

    dataLines.forEach(line => {
      const parts = line.split(',');
      const timeSlot = parts[4];
      const foodItem = parts[5];
      const price = parts[7];

      if (foodItem && price) {
        const itemName = foodItem.trim();
        const itemPrice = parseInt(price.trim());

        if (!foodItemCounts[itemName]) {
          foodItemCounts[itemName] = { price: itemPrice, count: 0 };
        }
        foodItemCounts[itemName].count++;
      }
    });

    // Convert to menu items with availability (simulate fresh daily stock)
    menuCache = Object.entries(foodItemCounts).map(([name, data]) => ({
      name,
      price: data.price,
      category: getCategoryByTimeSlot(name),
      availability: DAILY_STOCK_LIMITS[name] || 20, // Fresh daily stock
      totalOrdered: Math.min(data.count, 5) // Show some orders but not too many
    }));

    return menuCache;
  } catch (error) {
    console.error('Error loading menu:', error);
    return [];
  }
}

function getCategoryByTimeSlot(item) {
  // Simple categorization based on common items
  if (['Tea', 'Coffee'].includes(item)) return 'Beverages';
  if (['Masala Dosa', 'Uttappa', 'Idli', 'Medu Vada'].includes(item)) return 'South Indian';
  if (['Vada Pav', 'Samosa', 'Samosa Chaat'].includes(item)) return 'Snacks';
  if (['Aloo Paratha', 'Poha', 'Upma'].includes(item)) return 'North Indian';
  return 'Main Course';
}

export async function placeOrder(foodItem, quantity) {
  const menu = await loadMenuFromCSV();
  const menuItem = menu.find(item => item.name === foodItem);

  if (!menuItem) {
    return {
      success: false,
      message: `${foodItem} is not available on the menu.`
    };
  }

  if (menuItem.availability < quantity) {
    return {
      success: false,
      message: `Sorry, ${foodItem} is unavailable today. Only ${menuItem.availability} remaining. Please choose another item.`
    };
  }

  // Generate token ID
  const tokenId = `QL${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;

  // Calculate estimated time (3 minutes per order ahead + prep time)
  const ordersAhead = currentOrders.filter(o => o.status !== 'completed').length;
  const estimatedTime = Math.max(
    3,
    ordersAhead * 2 + Math.floor(Math.random() * 5) + 3
  );

  // Create order
  const order = {
    id: `O${Date.now()}`,
    foodItem,
    quantity,
    price: menuItem.price,
    totalAmount: menuItem.price * quantity,
    tokenId,
    status: 'ordered',
    estimatedTime,
    timestamp: new Date()
  };

  currentOrders.push(order);

  // Update availability
  menuItem.availability -= quantity;

  // Simulate order progression
  setTimeout(() => updateOrderStatus(tokenId, 'preparing'), 2000);
  setTimeout(() => updateOrderStatus(tokenId, 'ready'), estimatedTime * 60 * 1000);

  return {
    success: true,
    message: 'Your order is accepted ✅',
    order,
    tokenId,
    estimatedTime
  };
}

export function getOrderStatus(tokenId) {
  return currentOrders.find(order => order.tokenId === tokenId) || null;
}

export function updateOrderStatus(tokenId, status) {
  const order = currentOrders.find(o => o.tokenId === tokenId);
  if (order) {
    order.status = status;
  }
}

export function getDashboardData() {
  const activeOrders = currentOrders.filter(o => o.status !== 'completed');
  const completedToday = currentOrders.filter(o => o.status === 'completed').length;

  // Calculate popular items
  const itemCounts = currentOrders.reduce((acc, order) => {
    acc[order.foodItem] = (acc[order.foodItem] || 0) + order.quantity;
    return acc;
  }, {});

  const mostPopular = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return {
    activeOrders,
    totalOrders: currentOrders.length,
    completedToday,
    revenue: currentOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    averageWaitTime:
      activeOrders.length > 0
        ? Math.round(
            activeOrders.reduce((sum, order) => sum + order.estimatedTime, 0) /
              activeOrders.length
          )
        : 0,
    mostPopular
  };
}
