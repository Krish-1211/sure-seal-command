import { Parser } from 'json2csv';

/**
 * Transforms order data into the ERP-compatible CSV format.
 * Each order item becomes a separate row.
 * 
 * @param {Array} orders - Array of order objects with nested items and customer details
 * @returns {string} - CSV string formatted for ERP import
 */
export const transformOrdersToERPCsv = (orders) => {
  const flattenedData = [];

  orders.forEach((order) => {
    // Each item in order.items becomes ONE row in CSV
    order.items.forEach((item) => {
      const row = {
        "Addr 1 - Line 1": order.customer?.name || "",
        "Addr 1 - Line 2": order.customer?.address1 || "",
        "Addr 1 - Line 3": `${order.customer?.city || ""} ${order.customer?.state || ""} ${order.customer?.zip || ""}`.trim(),
        "Addr 1 - Line 4": order.customer?.country || "",
        "Total": `$${(order.total || 0).toFixed(2)}`,
        "Comment": order.comment || "",
        "Delivery Status": "P",
        "Description": item.name || "",
        "Freight Amount": 0,
        "Freight Tax Amount": 0,
        "Item Number": item.sku || "",
        "Location ID": item.location || "",
        "Discount": item.discount || "0%",
        "Shipping Date": order.shippingDate || "",
        "Salesperson First Name": order.salesperson?.firstName || "",
        "Salesperson Last Name": order.salesperson?.lastName || "",
        "Ship Via": order.shipVia || "",
        "Price": `$${(item.price || 0).toFixed(4)}`,
        "Quantity": (item.quantity || 0).toFixed(6),
        "Customer PO": order.poNumber || "",
        "Sale Status": "O",
        "Tax Code": "GST",
        "Freight Tax Code": "GST",
        "Drawer/Account Name": order.drawerAccountName || "",
        "Referral Source": order.referralSource || "",
        "Name on Card": order.nameOnCard || "",
        "Card Number": order.cardNumber || "",
        "Record ID": order.id || ""
      };
      
      flattenedData.push(row);
    });
  });

  const fields = [
    "Addr 1 - Line 1",
    "Addr 1 - Line 2",
    "Addr 1 - Line 3",
    "Addr 1 - Line 4",
    "Total",
    "Comment",
    "Delivery Status",
    "Description",
    "Freight Amount",
    "Freight Tax Amount",
    "Item Number",
    "Location ID",
    "Discount",
    "Shipping Date",
    "Salesperson First Name",
    "Salesperson Last Name",
    "Ship Via",
    "Price",
    "Quantity",
    "Customer PO",
    "Sale Status",
    "Tax Code",
    "Freight Tax Code",
    "Drawer/Account Name",
    "Referral Source",
    "Name on Card",
    "Card Number",
    "Record ID"
  ];

  const parser = new Parser({ fields });
  return parser.parse(flattenedData);
};
