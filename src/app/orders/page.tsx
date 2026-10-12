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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Orders
            </span>
            <span className="text-slate-500 font-mono text-xs">({orders.length} Orders)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Order Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer orders, assign courier partners, and update fulfillment progress.
          </p>
        </div>

        <button
          onClick={loadOrders}
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reload</span>
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
          {['all', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition whitespace-nowrap ${
                activeStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center gap-3 justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order # (BH-2026-...), Customer Phone, or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-lg bg-slate-950/40 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-700/60"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Payment:</span>
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="bg-slate-950/40 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3.5">Order #</th>
                <th className="py-2.5 px-3.5">Customer</th>
                <th className="py-2.5 px-3.5">Shipping Address</th>
                <th className="py-2.5 px-3.5">Items</th>
                <th className="py-2.5 px-3.5">Payment</th>
                <th className="py-2.5 px-3.5">Total</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Courier & AWB</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusStyle = getStatusColor(order.order_status);
                  const phoneClean = order.shipping_address?.phone?.replace(/\D/g, '') || '';

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition group">
                      {/* Order Number & Date */}
                      <td className="py-3 px-3.5 font-mono">
                        <button
                          onClick={() => openOrderDrawer(order)}
                          type="button"
                          className="font-medium text-slate-200 hover:text-indigo-400 transition text-left cursor-pointer"
                        >
                          {order.order_number}
                        </button>
                        <span className="block text-[10px] text-slate-500 font-sans">
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-3.5">
                        <span className="font-medium text-slate-200 block">
                          {order.shipping_address?.full_name || 'Guest User'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {order.shipping_address?.phone}
                          </span>
                          {phoneClean && (
                            <a
                              href={`https://wa.me/91${phoneClean}?text=Hello%20${encodeURIComponent(
                                order.shipping_address?.full_name || ''
                              )},%20this%20is%20BroHood%20regarding%20your%20order%20${
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
                      <td className="py-3 px-3.5 text-slate-400 max-w-[160px] truncate">
                        <span>{order.shipping_address?.city}, {order.shipping_address?.state}</span>
                        <span className="block text-[10px] font-mono text-slate-500">
                          PIN: {order.shipping_address?.pincode}
                        </span>
                      </td>

                      {/* Line items summary */}
                      <td className="py-3 px-3.5">
                        <span className="font-medium text-slate-300">
                          {order.items?.length || 0} item(s)
                        </span>
                        <span className="block text-[10px] text-slate-500 truncate max-w-[120px]">
                          {order.items?.[0]?.variant_name || 'Item'}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-medium border ${
                            order.payment_method === 'cod'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {order.payment_method === 'cod' ? 'COD' : 'Online'}
                        </span>
                        <span className="block text-[10px] text-slate-500 capitalize mt-0.5">
                          {order.payment_status}
                        </span>
                      </td>

                      {/* Final Total */}
                      <td className="py-3 px-3.5 font-mono font-medium text-white">
                        {formatINR(order.final_total)}
                      </td>

                      {/* Order Status */}
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {order.order_status}
                        </span>
                      </td>

                      {/* Courier & AWB */}
                      <td className="py-3 px-3.5 text-slate-300">
                        {order.courier_partner ? (
                          <div>
                            <span className="font-medium text-slate-200 block">
                              {order.courier_partner}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {order.tracking_number || 'Pending AWB'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openOrderDrawer(order)}
                            type="button"
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Manage</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl relative">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-medium">
                  Order Fulfillment
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
                  title="Print Packing Slip"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Packing Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  type="button"
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="py-4 space-y-4">
              {/* Customer & Shipping Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-medium block mb-1">
                    Customer Details
                  </span>
                  <p className="font-semibold text-white text-sm">
                    {selectedOrder.shipping_address?.full_name}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedOrder.shipping_address?.phone}
                  </p>
                  <div className="mt-2">
                    <a
                      href={`https://wa.me/91${selectedOrder.shipping_address?.phone?.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(selectedOrder.shipping_address?.full_name || '')},%20this%20is%20BroHood.%20Your%20order%20${selectedOrder.order_number}%20has%20been%20dispatched!`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp Customer</span>
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-medium block mb-1">
                    Shipping Address
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedOrder.shipping_address?.address_line1}
                    <br />
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}
                    <br />
                    <span className="font-mono font-medium text-white">
                      Pincode: {selectedOrder.shipping_address?.pincode}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Items List */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
                  Order Items
                </span>
                <div className="space-y-1.5">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-md bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.product?.primary_image ? (
                            <img
                              src={item.product.primary_image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">
                            {item.product?.title || item.variant_name}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            Variant: {item.variant_name || 'Standard'} • Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-medium text-white">
                          {formatINR(item.total_price)}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          ({formatINR(item.unit_price)} each)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-200">{formatINR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount Applied:</span>
                    <span className="font-mono">-{formatINR(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Shipping Fee:</span>
                  <span className="font-mono text-slate-200">
                    {selectedOrder.shipping_fee > 0 ? formatINR(selectedOrder.shipping_fee) : 'FREE'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-semibold text-sm text-white">
                  <span>Final Total ({selectedOrder.payment_method.toUpperCase()}):</span>
                  <span className="font-mono text-indigo-400">{formatINR(selectedOrder.final_total)}</span>
                </div>
              </div>

              {/* Fulfillment & Courier Dispatch Controls */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  Courier & Fulfillment Status
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Order Status
                    </label>
                    <select
                      value={orderStatusInput}
                      onChange={(e) => setOrderStatusInput(e.target.value as OrderStatus)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs capitalize focus:border-indigo-500"
                    >
                      <option value="placed">Placed (Pending)</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Courier Partner
                    </label>
                    <select
                      value={courierPartnerInput}
                      onChange={(e) => setCourierPartnerInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500"
                    >
                      {COURIER_PARTNERS.map((cp) => (
                        <option key={cp} value={cp}>
                          {cp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Tracking / AWB Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DEL-8899210"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={savingFulfillment}
                    onClick={handleSaveFulfillment}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {savingFulfillment ? 'Updating...' : 'Update Fulfillment'}
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
