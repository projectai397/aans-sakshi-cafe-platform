import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye, CheckCircle, Clock, XCircle } from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  type: string;
  division: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
  items: string;
}

const SAMPLE_ORDERS: Order[] = [
  {
    id: 1,
    orderNumber: "ORD-1762698000-abc123def",
    date: "2025-11-09",
    type: "Membership",
    division: "Sakshi",
    amount: 2499,
    status: "completed",
    paymentMethod: "Stripe",
    items: "Premium Membership (3 Months)",
  },
  {
    id: 2,
    orderNumber: "ORD-1762697500-xyz789uvw",
    date: "2025-11-08",
    type: "Product Purchase",
    division: "SubCircle",
    amount: 2597,
    status: "completed",
    paymentMethod: "Razorpay",
    items: "Organic Cotton T-Shirt, Handmade Ceramic Mug",
  },
  {
    id: 3,
    orderNumber: "ORD-1762697000-pqr456stu",
    date: "2025-11-07",
    type: "Service",
    division: "AVE",
    amount: 5000,
    status: "completed",
    paymentMethod: "Bank Transfer",
    items: "Customer Service AI Module - Annual License",
  },
  {
    id: 4,
    orderNumber: "ORD-1762696500-mno123jkl",
    date: "2025-11-06",
    type: "Membership",
    division: "Sakshi",
    amount: 999,
    status: "pending",
    paymentMethod: "UPI",
    items: "Essential Membership (1 Month)",
  },
];

export default function PaymentHistory() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredOrders =
    filterStatus === "all" ? SAMPLE_ORDERS : SAMPLE_ORDERS.filter((order) => order.status === filterStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-500/20 text-green-700",
      pending: "bg-yellow-500/20 text-yellow-700",
      failed: "bg-red-500/20 text-red-700",
    };
    return styles[status as keyof typeof styles] || "";
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Payment History</h1>
          <p className="text-muted-foreground">View and manage all your orders and invoices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-cyan-500">{SAMPLE_ORDERS.length}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <p className="text-sm text-muted-foreground mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-500">
              {SAMPLE_ORDERS.filter((o) => o.status === "completed").length}
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <p className="text-sm text-muted-foreground mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-500">
              {SAMPLE_ORDERS.filter((o) => o.status === "pending").length}
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
            <p className="text-3xl font-bold text-purple-500">
              ₹{SAMPLE_ORDERS.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
            </p>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === "all"
                  ? "bg-cyan-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              Pending
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Division</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm text-foreground font-mono">{order.orderNumber.slice(0, 15)}...</td>
                    <td className="py-3 px-4 text-sm text-foreground">{order.date}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{order.type}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{order.division}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-cyan-500">₹{order.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-muted rounded text-cyan-500"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-muted rounded text-cyan-500"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {selectedOrder && (
          <Card className="p-6 border-cyan-500/30 bg-cyan-500/5">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-lg font-semibold text-foreground">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="text-lg font-semibold text-foreground">{selectedOrder.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <p className="text-lg font-semibold text-foreground">{selectedOrder.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="bg-card rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Items</p>
              <p className="text-foreground">{selectedOrder.items}</p>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-border mb-6">
              <span className="text-lg font-bold text-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-cyan-500">₹{selectedOrder.amount.toLocaleString()}</span>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice PDF
              </Button>
              <Button variant="outline" className="flex-1">
                Print Invoice
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
