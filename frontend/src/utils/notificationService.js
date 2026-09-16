/**
 * ShopStack Notification Service
 * Manages dynamic notifications, read/unread states, and domain-specific alerts
 * for Customer, Vendor, Admin, and Warehouse Dashboards.
 */

const NOTIF_STORAGE_KEY_PREFIX = 'shopstack_read_notifs_';
const NOTIF_DISMISSED_KEY_PREFIX = 'shopstack_dismissed_notifs_';

export function getReadNotifIds(userId = 'guest') {
  try {
    const raw = sessionStorage.getItem(`${NOTIF_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function markNotifAsRead(notifId, userId = 'guest') {
  try {
    const ids = getReadNotifIds(userId);
    if (!ids.includes(notifId)) {
      ids.push(notifId);
      sessionStorage.setItem(`${NOTIF_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(ids));
    }
  } catch (e) {}
}

export function markAllNotifsAsRead(notifIds = [], userId = 'guest') {
  try {
    const ids = getReadNotifIds(userId);
    const combined = [...new Set([...ids, ...notifIds])];
    sessionStorage.setItem(`${NOTIF_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(combined));
  } catch (e) {}
}

export function getDismissedNotifIds(userId = 'guest') {
  try {
    const raw = sessionStorage.getItem(`${NOTIF_DISMISSED_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function dismissNotif(notifId, userId = 'guest') {
  try {
    const ids = getDismissedNotifIds(userId);
    if (!ids.includes(notifId)) {
      ids.push(notifId);
      sessionStorage.setItem(`${NOTIF_DISMISSED_KEY_PREFIX}${userId}`, JSON.stringify(ids));
    }
  } catch (e) {}
}

export function clearAllNotifs(userId = 'guest') {
  try {
    sessionStorage.setItem(`${NOTIF_DISMISSED_KEY_PREFIX}${userId}`, JSON.stringify(['__all__']));
  } catch (e) {}
}

/**
 * Generate rich customer notifications
 */
export function generateCustomerNotifications({
  user,
  orders = [],
  wishlist = [],
  products = [],
  onOpenOrders,
  onOpenCart,
  onOpenWishlist,
  onCopyCoupon
}) {
  const userId = user?.id || 'guest';
  const readIds = getReadNotifIds(userId);
  const dismissedIds = getDismissedNotifIds(userId);
  if (dismissedIds.includes('__all__')) return [];

  const list = [];

  // 1. Order Lifecycle Notifications from real orders
  if (Array.isArray(orders)) {
    orders.forEach((order, idx) => {
      const orderId = order.id || `ORD-${idx + 1}`;
      const status = (order.orderStatus || 'PLACED').toUpperCase();
      const amount = Number(order.totalAmount || 0).toLocaleString('en-IN');
      const itemCount = order.items?.length || 1;

      if (status === 'PLACED' || status === 'PROCESSING' || status === 'CONFIRMED') {
        const notifId = `cust_order_conf_${orderId}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'order_confirmed',
          title: `Order #${orderId} Confirmed & Paid`,
          message: `Payment of ₹${amount} successful. ${itemCount} item(s) being prepared by seller.`,
          time: 'Just now',
          badge: 'CONFIRMED',
          badgeType: 'success',
          actionLabel: 'Track Order',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      } else if (status === 'SHIPPED') {
        const notifId = `cust_order_ship_${orderId}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'order_shipped',
          title: `Order #${orderId} Dispatched`,
          message: `Your package has left the fulfillment hub with ${order.deliveryPartner || 'ShopStack Express'}.`,
          time: '2h ago',
          badge: 'IN TRANSIT',
          badgeType: 'info',
          actionLabel: 'Live Tracking',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      } else if (status === 'OUT_FOR_DELIVERY') {
        const notifId = `cust_order_ofd_${orderId}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'order_shipped',
          title: `Order #${orderId} Out for Delivery`,
          message: `Delivery agent is on the way to your address! Arriving today.`,
          time: '1h ago',
          badge: 'ARRIVING TODAY',
          badgeType: 'warning',
          actionLabel: 'Track Agent',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      } else if (status === 'DELIVERED') {
        const notifId = `cust_order_del_${orderId}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'order_delivered',
          title: `Order #${orderId} Delivered`,
          message: `Package was successfully delivered. Enjoy your purchase! Leave a review to earn reward points.`,
          time: 'Yesterday',
          badge: 'DELIVERED',
          badgeType: 'success',
          actionLabel: 'View Invoice',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      } else if (status === 'CANCELLED') {
        const notifId = `cust_order_canc_${orderId}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'warning',
          title: `Order #${orderId} Cancelled & Refunded`,
          message: `Refund of ₹${amount} initiated to your original payment method.`,
          time: '1d ago',
          badge: 'REFUNDED',
          badgeType: 'danger',
          actionLabel: 'View Details',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      }
    });
  }

  // 2. Active Coupons & Discount Vouchers
  list.push({
    id: 'cust_coupon_welcome20',
    category: 'offers',
    iconType: 'coupon',
    title: '🎉 Flat 20% OFF Welcome Coupon',
    message: 'Use coupon code WELCOME20 to get 20% off on your checkout (max discount ₹500).',
    time: 'Live',
    codeToCopy: 'WELCOME20',
    badge: '20% OFF',
    badgeType: 'warning',
    actionLabel: 'Copy Code',
    onAction: () => onCopyCoupon && onCopyCoupon('WELCOME20')
  });

  list.push({
    id: 'cust_coupon_festive150',
    category: 'offers',
    iconType: 'coupon',
    title: '✨ Special ₹150 OFF Voucher',
    message: 'Extra ₹150 discount on orders above ₹999 across all store categories. Code: FESTIVE150',
    time: 'Limited Time',
    codeToCopy: 'FESTIVE150',
    badge: '₹150 OFF',
    badgeType: 'warning',
    actionLabel: 'Copy Code',
    onAction: () => onCopyCoupon && onCopyCoupon('FESTIVE150')
  });

  list.push({
    id: 'cust_coupon_freeship',
    category: 'offers',
    iconType: 'coupon',
    title: '🚚 Free Express Shipping Coupon',
    message: 'Zero shipping fee on cart orders above ₹499. Apply code FREESHIP at checkout.',
    time: 'Active',
    codeToCopy: 'FREESHIP',
    badge: 'FREE DELIVERY',
    badgeType: 'success',
    actionLabel: 'Copy Code',
    onAction: () => onCopyCoupon && onCopyCoupon('FREESHIP')
  });

  // 3. Featured Deal / Price Drops
  list.push({
    id: 'cust_deal_megasale',
    category: 'offers',
    iconType: 'discount',
    title: '🔥 Mega Tech Deals Live',
    message: 'Up to 50% discount on Smart Gadgets, Audio, and Premium Electronics this week!',
    time: 'Today',
    badge: 'HOT DEAL',
    badgeType: 'danger',
    actionLabel: 'Explore Deals',
    onAction: () => onOpenCart && onOpenCart()
  });

  // Filter out dismissed notifications and attach read flag
  return list
    .filter(item => !dismissedIds.includes(item.id))
    .map(item => ({
      ...item,
      read: readIds.includes(item.id)
    }));
}

/**
 * Generate rich Vendor notifications
 */
export function generateVendorNotifications({
  user,
  products = [],
  orders = [],
  earnings = 0,
  onGoToTab
}) {
  const userId = user?.id || 'vendor';
  const readIds = getReadNotifIds(userId);
  const dismissedIds = getDismissedNotifIds(userId);
  if (dismissedIds.includes('__all__')) return [];

  const list = [];

  // 1. New Orders for vendor
  if (Array.isArray(orders) && orders.length > 0) {
    const recentOrder = orders[0];
    const orderId = recentOrder.id || '1042';
    const amount = Number(recentOrder.totalAmount || 1899).toLocaleString('en-IN');
    list.push({
      id: `vend_order_new_${orderId}`,
      category: 'orders',
      iconType: 'order_placed',
      title: `📦 New Order #${orderId} Received`,
      message: `Customer placed an order for ₹${amount}. Ready for packing & shipping label generation.`,
      time: '10m ago',
      badge: 'ACTION REQUIRED',
      badgeType: 'warning',
      actionLabel: 'Fulfill Order',
      onAction: () => onGoToTab && onGoToTab('orders')
    });
  } else {
    list.push({
      id: 'vend_order_sample',
      category: 'orders',
      iconType: 'order_placed',
      title: '📦 Order Management Ready',
      message: 'Your merchant store is live. New customer orders will trigger real-time notifications here.',
      time: 'Live',
      badge: 'ONLINE',
      badgeType: 'success',
      actionLabel: 'View Orders',
      onAction: () => onGoToTab && onGoToTab('orders')
    });
  }

  // 2. Product Approvals & Status
  if (Array.isArray(products)) {
    const approvedProducts = products.filter(p => p.approvalStatus === 'APPROVED' || !p.approvalStatus);
    const pendingProducts = products.filter(p => p.approvalStatus === 'PENDING');
    const lowStockProducts = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5);

    if (approvedProducts.length > 0) {
      const p = approvedProducts[0];
      list.push({
        id: `vend_prod_appr_${p.id || 1}`,
        category: 'products',
        iconType: 'product_approved',
        title: `✅ Product Approved: ${p.name || 'Your Product'}`,
        message: `Your listing passed admin quality compliance and is actively visible in store searches.`,
        time: '3h ago',
        badge: 'LIVE IN STORE',
        badgeType: 'success',
        actionLabel: 'View Catalog',
        onAction: () => onGoToTab && onGoToTab('products')
      });
    }

    if (pendingProducts.length > 0) {
      const p = pendingProducts[0];
      list.push({
        id: `vend_prod_pend_${p.id || 2}`,
        category: 'products',
        iconType: 'product_pending',
        title: `⏳ In Review: ${p.name || 'New Listing'}`,
        message: `${pendingProducts.length} product(s) in administrator quality moderation queue.`,
        time: '1h ago',
        badge: 'PENDING REVIEW',
        badgeType: 'warning',
        actionLabel: 'Check Status',
        onAction: () => onGoToTab && onGoToTab('products')
      });
    }

    // 3. Low Stock Alerts
    if (lowStockProducts.length > 0) {
      const p = lowStockProducts[0];
      list.push({
        id: `vend_stock_low_${p.id || 3}`,
        category: 'stock',
        iconType: 'low_stock',
        title: `⚠️ Low Stock Warning: ${p.name || 'Inventory Item'}`,
        message: `Only ${p.stock} unit(s) left in inventory! Restock to prevent lost sales orders.`,
        time: '30m ago',
        badge: 'LOW STOCK',
        badgeType: 'danger',
        actionLabel: 'Restock SKU',
        onAction: () => onGoToTab && onGoToTab('inventory')
      });
    }
  }

  // 4. Payouts & Settlement
  list.push({
    id: 'vend_payout_ready',
    category: 'payouts',
    iconType: 'payout',
    title: '💰 Payout Settlement Processed',
    message: 'Merchant revenue calculation updated for this cycle. Available balance ready for transfer.',
    time: '1d ago',
    badge: 'PAYOUTS',
    badgeType: 'purple',
    actionLabel: 'View Statement',
    onAction: () => onGoToTab && onGoToTab('payouts')
  });

  // 5. Customer Review Feedback
  list.push({
    id: 'vend_review_feedback',
    category: 'system',
    iconType: 'system',
    title: '⭐ 5-Star Customer Review',
    message: 'A verified buyer left positive 5-star feedback on your product catalog.',
    time: '2d ago',
    badge: 'FEEDBACK',
    badgeType: 'success',
    actionLabel: 'View Analytics',
    onAction: () => onGoToTab && onGoToTab('analytics')
  });

  return list
    .filter(item => !dismissedIds.includes(item.id))
    .map(item => ({
      ...item,
      read: readIds.includes(item.id)
    }));
}

/**
 * Generate rich Admin notifications
 */
export function generateAdminNotifications({
  user,
  pendingProductsCount = 0,
  ordersCount = 0,
  vendorsCount = 0,
  onGoToTab
}) {
  const userId = user?.id || 'admin';
  const readIds = getReadNotifIds(userId);
  const dismissedIds = getDismissedNotifIds(userId);
  if (dismissedIds.includes('__all__')) return [];

  const list = [];

  // 1. Pending Product Submissions
  if (pendingProductsCount > 0) {
    list.push({
      id: `admin_pend_prods_${pendingProductsCount}`,
      category: 'approvals',
      iconType: 'admin_alert',
      title: `🛡️ ${pendingProductsCount} Product(s) Pending Review`,
      message: 'New vendor catalog submissions awaiting administrator verification and approval.',
      time: 'Live',
      badge: 'URGENT REVIEW',
      badgeType: 'danger',
      actionLabel: 'Review Queue',
      onAction: () => onGoToTab && onGoToTab('products')
    });
  }

  // 2. Vendor Management
  list.push({
    id: 'admin_vendor_onboard',
    category: 'vendors',
    iconType: 'product_approved',
    title: '🏪 Merchant Ecosystem Active',
    message: `${vendorsCount || 'Multiple'} registered vendor stores operating on the multi-vendor network.`,
    time: '1h ago',
    badge: 'VENDORS',
    badgeType: 'purple',
    actionLabel: 'Manage Vendors',
    onAction: () => onGoToTab && onGoToTab('vendors')
  });

  // 3. Platform Order Volume
  list.push({
    id: 'admin_orders_traffic',
    category: 'orders',
    iconType: 'order_confirmed',
    title: '💳 Platform Transaction Stream',
    message: `${ordersCount || 'Live'} customer orders processed across regional zones and hubs.`,
    time: '2h ago',
    badge: 'PLATFORM REVENUE',
    badgeType: 'success',
    actionLabel: 'View Orders',
    onAction: () => onGoToTab && onGoToTab('orders')
  });

  // 4. Logistics & Warehouses
  list.push({
    id: 'admin_logistics_status',
    category: 'system',
    iconType: 'shipping',
    title: '🚚 Warehouse Logistics Online',
    message: 'Automated warehouse allocation routing orders to closest regional fulfillment centers.',
    time: '3h ago',
    badge: 'LOGISTICS',
    badgeType: 'info',
    actionLabel: 'Manage Warehouses',
    onAction: () => onGoToTab && onGoToTab('warehouses')
  });

  // 5. Payout Settlement
  list.push({
    id: 'admin_payout_reconcile',
    category: 'payouts',
    iconType: 'payout',
    title: '📈 Commission & Payouts Engine',
    message: 'Platform fee deductions and vendor commission accounts reconciled.',
    time: '1d ago',
    badge: 'FINANCE',
    badgeType: 'purple',
    actionLabel: 'Manage Payouts',
    onAction: () => onGoToTab && onGoToTab('payouts')
  });

  return list
    .filter(item => !dismissedIds.includes(item.id))
    .map(item => ({
      ...item,
      read: readIds.includes(item.id)
    }));
}

/**
 * Generate rich Warehouse Staff notifications
 */
export function generateWarehouseNotifications({
  user,
  pendingAllocationsCount = 0,
  onGoToQueue
}) {
  const userId = user?.id || 'staff';
  const readIds = getReadNotifIds(userId);
  const dismissedIds = getDismissedNotifIds(userId);
  if (dismissedIds.includes('__all__')) return [];

  const list = [];

  // 1. Order Allocations
  if (pendingAllocationsCount > 0) {
    list.push({
      id: `wh_alloc_tasks_${pendingAllocationsCount}`,
      category: 'picking',
      iconType: 'warehouse_alloc',
      title: `📦 ${pendingAllocationsCount} New Pick Task(s) Allocated`,
      message: `Administrator assigned order items to ${user?.warehouseName || 'your facility'} for physical picking.`,
      time: 'Live',
      badge: 'PRIORITY PICK',
      badgeType: 'danger',
      actionLabel: 'Open Picking Queue',
      onAction: () => onGoToQueue && onGoToQueue('fulfillment', 'pick')
    });
  } else {
    list.push({
      id: 'wh_alloc_clear',
      category: 'picking',
      iconType: 'warehouse_alloc',
      title: '📦 Picking Queue Clear',
      message: 'All current picking tasks have been processed. Standing by for incoming order allocations.',
      time: 'Live',
      badge: 'READY',
      badgeType: 'success',
      actionLabel: 'View Queue',
      onAction: () => onGoToQueue && onGoToQueue('fulfillment', 'pick')
    });
  }

  // 2. Packing & Barcoding
  list.push({
    id: 'wh_packing_ready',
    category: 'packing',
    iconType: 'pack',
    title: '📦 Packaging & Labeling Station',
    message: 'Picked consignments ready for carton boxing, tamper seals, and barcode verification.',
    time: '45m ago',
    badge: 'PACKING',
    badgeType: 'info',
    actionLabel: 'Open Packing Queue',
    onAction: () => onGoToQueue && onGoToQueue('fulfillment', 'pack')
  });

  // 3. Driver & Logistics Dispatch
  list.push({
    id: 'wh_dispatch_pickup',
    category: 'dispatch',
    iconType: 'shipping',
    title: '🚚 Carrier Dispatch Scheduled',
    message: 'Express courier driver assigned for outbound manifest pickup and customer transit.',
    time: '1h ago',
    badge: 'DISPATCH',
    badgeType: 'warning',
    actionLabel: 'Open Dispatch Queue',
    onAction: () => onGoToQueue && onGoToQueue('fulfillment', 'dispatch')
  });

  // 4. Inventory Bin Restock
  list.push({
    id: 'wh_bin_restock',
    category: 'stock',
    iconType: 'low_stock',
    title: '⚠️ Fast-Moving Bin Restock Notice',
    message: 'Automated replenishment alert: restock high-frequency pick bins from bulk racks.',
    time: '2h ago',
    badge: 'BIN RESTOCK',
    badgeType: 'warning',
    actionLabel: 'Inspect Stock',
    onAction: () => onGoToQueue && onGoToQueue('inventory')
  });

  return list
    .filter(item => !dismissedIds.includes(item.id))
    .map(item => ({
      ...item,
      read: readIds.includes(item.id)
    }));
}
