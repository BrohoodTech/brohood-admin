'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  Printer,
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Package,
} from 'lucide-react';
import { Order, OrderStatus, PaymentMethod } from '@/lib/types';
import { formatINR, formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

const COURIER_PARTNERS = ['Delhivery', 'BlueDart', 'Xpressbees', 'DTDC', 'Shadowfax'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Selected Order Drawer / Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusInput, setOrderStatusInput] = useState<OrderStatus>('placed');
  const [courierPartnerInput, setCourierPartnerInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [savingFulfillment, setSavingFulfillment] = useState(false);

  // Thermal Print Modal State
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  const { success, error: toastError, info } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/orders?status=${activeStatus}&payment=${selectedPayment}&search=${encodeURIComponent(search)}`
      );
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data || []);
    } catch (err: any) {
      toastError(err.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeStatus, selectedPayment]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  // Open drawer
  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatusInput(order.order_status);
    setCourierPartnerInput(order.courier_partner || 'Delhivery');
    setTrackingNumberInput(order.tracking_number || '');
  };

  // Save fulfillment updates
  const handleSaveFulfillment = async () => {
    if (!selectedOrder) return;
    setSavingFulfillment(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: orderStatusInput,
          courier_partner: courierPartnerInput,
          tracking_number: trackingNumberInput,
        }),
      });

      if (!res.ok) throw new Error('Failed to update order fulfillment');
      const updatedOrder = await res.json();
      setSelectedOrder(updatedOrder);
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      success(`Order ${updatedOrder.order_number} fulfillment updated!`);
    } catch (err: any) {
      toastError(err.message || 'Error updating order');
    } finally {
      setSavingFulfillment(false);
    }
  };

  // Clean print invoice trigger
  const handlePrintSlip = () => {
    setShowPrintSlip(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2128] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#e5c158] font-bold">
              DISPATCH & FULFILLMENT
            </span>
            <span className="text-zinc-500 font-mono text-xs">({orders.length} Orders)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Order Operations Board
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Dispatch queue, tracking AWB generation, courier partner assignment, and WhatsApp CRM.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14161f] border border-[#232634] hover:bg-[#1a1d29] text-zinc-300 text-xs font-medium transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#e5c158]" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121318] border border-[#232635] overflow-x-auto">
          {['all', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                activeStatus === st
                  ? 'bg-[#1e212d] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#121318] border border-[#222533] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by Order # (BH-2026-...), Customer Phone, or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#e5c158]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#181a24] text-[11px] font-semibold text-zinc-300 hover:text-white border border-[#2e3347]"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Payment:</span>
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="bg-[#0a0b0e] border border-[#272b3b] text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#e5c158]"
              >
                <option value="all">All Methods</option>
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="razorpay">Razorpay Online</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#121318] border border-[#222533] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2128] bg-[#0e0f14] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Address / Pincode</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Courier & AWB</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1c26]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-zinc-500">
                    <div className="w-8 h-8 border-2 border-[#e5c158] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-zinc-500">
                    <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusStyle = getStatusColor(order.order_status);
                  const phoneClean = order.shipping_address?.phone?.replace(/\D/g, '') || '';

                  return (
                    <tr key={order.id} className="hover:bg-[#151722] transition group">
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <button
                          onClick={() => openOrderDrawer(order)}
                          className="font-bold text-white hover:text-[#e5c158] transition text-left cursor-pointer"
                        >
                          {order.order_number}
                        </button>
                        <span className="block text-[10px] text-zinc-500 font-sans">
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-200 block">
                          {order.shipping_address?.full_name || 'Guest User'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {order.shipping_address?.phone}
                          </span>
                          {phoneClean && (
                            <a
                              href={`https://wa.me/91${phoneClean}?text=Hello%20${encodeURIComponent(
                                order.shipping_address?.full_name || ''
                              )},%20this%20is%20BroHood%20Operations%20regarding%20your%20order%20${
                                order.order_number
                              }.`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-zinc-400 max-w-[160px] truncate">
                        <span>{order.shipping_address?.city}, {order.shipping_address?.state}</span>
                        <span className="block text-[10px] font-mono text-zinc-500">
                          PIN: {order.shipping_address?.pincode}
                        </span>
                      </td>

                      {/* Line items summary */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-zinc-300">
                          {order.items?.length || 0} item(s)
                        </span>
                        <span className="block text-[10px] text-zinc-500 truncate max-w-[120px]">
                          {order.items?.[0]?.variant_name || 'Item'}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                            order.payment_method === 'cod'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {order.payment_method === 'cod' ? 'COD' : 'RAZORPAY'}
                        </span>
                        <span className="block text-[10px] text-zinc-500 capitalize mt-0.5">
                          {order.payment_status}
                        </span>
                      </td>

                      {/* Final Total */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {formatINR(order.final_total)}
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {order.order_status}
                        </span>
                      </td>

                      {/* Courier & AWB */}
                      <td className="py-3.5 px-4 text-zinc-300">
                        {order.courier_partner ? (
                          <div>
                            <span className="font-semibold text-white block">
                              {order.courier_partner}
                            </span>
                            <span className="text-[10px] font-mono text-[#e5c158]">
                              {order.tracking_number || 'Pending AWB'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-600 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openOrderDrawer(order)}
                            className="px-3 py-1.5 rounded-lg bg-[#181a24] hover:bg-[#232738] text-[#e5c158] border border-[#2b2f42] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatch</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer & Fulfillment Controls */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-[#272b3b] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1f2128]">
              <div>
                <span className="text-[10px] font-mono text-[#e5c158] uppercase tracking-wider font-bold">
                  ORDER FULFILLMENT & DISPATCH
                </span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b1e2c] border border-[#2e334a] text-xs font-semibold text-zinc-200 hover:text-white transition cursor-pointer"
                  title="Print Packing Slip"
                >
                  <Printer className="w-3.5 h-3.5 text-[#e5c158]" />
                  <span>Packing Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="py-6 space-y-6">
              {/* Customer & Shipping Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0a0b0e] border border-[#202330]">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block mb-1">
                    Customer Details
                  </span>
                  <p className="font-bold text-white text-sm">
                    {selectedOrder.shipping_address?.full_name}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {selectedOrder.shipping_address?.phone}
                  </p>
                  <div className="mt-2">
                    <a
                      href={`https://wa.me/91${selectedOrder.shipping_address?.phone?.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(selectedOrder.shipping_address?.full_name || '')},%20this%20is%20BroHood.%20Your%20order%20${selectedOrder.order_number}%20has%20been%20dispatched!`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp Customer</span>
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block mb-1">
                    Shipping Address
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedOrder.shipping_address?.address_line1}
                    <br />
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}
                    <br />
                    <span className="font-mono font-bold text-white">
                      Pincode: {selectedOrder.shipping_address?.pincode}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Items List */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#e5c158] block mb-3">
                  Purchased Items Checklist
                </span>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#161822] border border-[#232635]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0e1017] border border-[#272b3b] overflow-hidden shrink-0 flex items-center justify-center">
                          {item.product?.primary_image ? (
                            <img
                              src={item.product.primary_image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {item.product?.title || item.variant_name}
                          </p>
                          <span className="text-[11px] text-zinc-400">
                            Variant: {item.variant_name || 'Standard'} • Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-white">
                          {formatINR(item.total_price)}
                        </span>
                        <span className="block text-[10px] text-zinc-500">
                          ({formatINR(item.unit_price)} each)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-[#0a0b0e] border border-[#202330] space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-zinc-200">{formatINR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount Applied:</span>
                    <span className="font-mono">-{formatINR(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping Fee:</span>
                  <span className="font-mono text-zinc-200">
                    {selectedOrder.shipping_fee > 0 ? formatINR(selectedOrder.shipping_fee) : 'FREE'}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#232635] flex justify-between font-bold text-sm text-white">
                  <span>Final Total ({selectedOrder.payment_method.toUpperCase()}):</span>
                  <span className="font-mono text-[#e5c158]">{formatINR(selectedOrder.final_total)}</span>
                </div>
              </div>

              {/* Fulfillment & Courier Dispatch Controls */}
              <div className="p-5 rounded-2xl bg-[#161822] border border-[#e5c158]/30 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5c158] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#e5c158]" />
                  Fulfillment & Courier Dispatch
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Fulfillment Status
                    </label>
                    <select
                      value={orderStatusInput}
                      onChange={(e) => setOrderStatusInput(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#282c3e] text-white text-xs capitalize"
                    >
                      <option value="placed">Placed (Pending)</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Courier Partner
                    </label>
                    <select
                      value={courierPartnerInput}
                      onChange={(e) => setCourierPartnerInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#282c3e] text-white text-xs"
                    >
                      {COURIER_PARTNERS.map((cp) => (
                        <option key={cp} value={cp}>
                          {cp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Tracking / AWB Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DEL-8899210"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#282c3e] text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={savingFulfillment}
                    onClick={handleSaveFulfillment}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] hover:from-[#fbe294] hover:to-[#edd06f] text-black font-bold text-xs uppercase tracking-wider transition shadow-md shadow-[#e5c158]/20 cursor-pointer"
                  >
                    {savingFulfillment ? 'Updating...' : 'Save & Dispatch Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Thermal Invoice / Packing Slip Modal */}
      {showPrintSlip && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-white text-black p-8 overflow-y-auto">
          <div className="max-w-xl mx-auto border-2 border-black p-6 space-y-4">
            <div className="flex justify-between items-start border-b-2 border-black pb-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight">BROHOOD</h1>
                <p className="text-xs uppercase tracking-widest font-bold">Warehouse Dispatch Slip</p>
                <p className="text-xs">Order: {selectedOrder.order_number}</p>
                <p className="text-xs">Date: {formatDate(selectedOrder.created_at)}</p>
              </div>
              <div className="text-right">
                <span className="border-2 border-black px-3 py-1 font-mono font-bold text-sm uppercase">
                  {selectedOrder.payment_method.toUpperCase()} -{' '}
                  {selectedOrder.payment_status.toUpperCase()}
                </span>
                <p className="text-xs font-mono mt-2">
                  Courier: {selectedOrder.courier_partner || 'N/A'}
                </p>
                <p className="text-xs font-mono font-bold">
                  AWB: {selectedOrder.tracking_number || 'N/A'}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-black pb-3">
              <p className="text-xs font-bold uppercase">Ship To:</p>
              <p className="text-sm font-bold">{selectedOrder.shipping_address?.full_name}</p>
              <p className="text-xs">{selectedOrder.shipping_address?.address_line1}</p>
              <p className="text-xs">
                {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} -{' '}
                {selectedOrder.shipping_address?.pincode}
              </p>
              <p className="text-xs font-bold font-mono">
                Phone: {selectedOrder.shipping_address?.phone}
              </p>
            </div>

            {/* Checklist */}
            <div>
              <p className="text-xs font-bold uppercase mb-2">Package Contents:</p>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black">
                    <th className="py-1">[ √ ]</th>
                    <th className="py-1">Item Title / Variant</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-2">[   ]</td>
                      <td className="py-2 font-semibold">
                        {item.product?.title || item.variant_name}
                      </td>
                      <td className="py-2 text-center font-bold">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">{formatINR(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="pt-3 border-t-2 border-black flex justify-between items-center text-sm font-bold">
              <span>Total Collectable:</span>
              <span className="font-mono">
                {selectedOrder.payment_method === 'cod'
                  ? formatINR(selectedOrder.final_total)
                  : '₹0 (PREPAID ONLINE)'}
              </span>
            </div>

            {/* Print Controls (Hidden on paper) */}
            <div className="pt-4 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-black text-white font-bold text-xs uppercase"
              >
                Print
              </button>
              <button
                onClick={() => setShowPrintSlip(false)}
                className="px-4 py-2 bg-gray-200 text-black font-bold text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
