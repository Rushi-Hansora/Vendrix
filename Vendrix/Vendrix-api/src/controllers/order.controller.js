const prisma = require('../utils/prisma');

const createOrder = async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]
  if (!items || !items.length) return res.status(400).json({ message: 'Items are required' });

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  let totalPrice = 0;
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    const unitPrice = product.price;
    totalPrice += unitPrice * item.quantity;
    return { productId: item.productId, quantity: item.quantity, unitPrice };
  });

  const order = await prisma.order.create({
    data: {
      buyerId: req.user.id,
      totalPrice,
      items: { create: orderItems },
    },
    include: { items: { include: { product: true } } },
  });

  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user.id },
    include: { items: { include: { product: { select: { name: true, imageUrl: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, buyerId: req.user.id },
    include: { items: { include: { product: true } }, invoice: true },
  });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
  res.json(order);
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus };
