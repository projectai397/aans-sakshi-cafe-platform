import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Send, CheckCircle, AlertCircle, Eye } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "order-confirmation",
    name: "Order Confirmation",
    description: "Sent when a customer completes a purchase",
    category: "Orders",
    preview: "Thank you for your order! Your order has been received and is being processed.",
  },
  {
    id: "payment-receipt",
    name: "Payment Receipt",
    description: "Sent after successful payment processing",
    category: "Payments",
    preview: "Your payment has been successfully processed. Transaction ID: TXN-XXXXX",
  },
  {
    id: "membership-activation",
    name: "Membership Activation",
    description: "Sent when a membership is activated",
    category: "Memberships",
    preview: "Congratulations! Your membership is now active. Start enjoying your benefits!",
  },
  {
    id: "newsletter-welcome",
    name: "Newsletter Welcome",
    description: "Sent to new newsletter subscribers",
    category: "Newsletter",
    preview: "Welcome to AANS Newsletter! Stay updated with the latest news and insights.",
  },
  {
    id: "order-shipped",
    name: "Order Shipped",
    description: "Sent when an order is shipped",
    category: "Orders",
    preview: "Your order is on its way! Track your package with the provided tracking number.",
  },
  {
    id: "refund-processed",
    name: "Refund Processed",
    description: "Sent when a refund is completed",
    category: "Payments",
    preview: "Your refund has been processed successfully. Amount: ₹XXXX",
  },
];

export default function EmailNotifications() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [sentEmails, setSentEmails] = useState<Array<{ id: string; timestamp: string; status: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendTestEmail = async () => {
    if (!testEmail || !selectedTemplate) {
      alert("Please select a template and enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate sending email
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newEmail = {
        id: selectedTemplate,
        timestamp: new Date().toLocaleString(),
        status: "sent",
      };

      setSentEmails([newEmail, ...sentEmails]);
      setTestEmail("");
      alert(`Test email sent to ${testEmail}`);
    } catch (error) {
      alert("Failed to send test email");
    } finally {
      setIsLoading(false);
    }
  };

  const currentTemplate = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-width mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Email Notifications</h1>
          <p className="text-muted-foreground">Manage and preview email templates sent to customers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Email Templates</h2>
              <div className="space-y-2">
                {EMAIL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedTemplate === template.id
                        ? "bg-cyan-500 text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <p className="font-semibold">{template.name}</p>
                    <p className="text-xs opacity-75">{template.category}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Template Preview & Test */}
          <div className="lg:col-span-2 space-y-6">
            {currentTemplate ? (
              <>
                {/* Template Preview */}
                <Card className="p-6 border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-cyan-500" />
                    <h2 className="text-xl font-bold text-foreground">{currentTemplate.name}</h2>
                  </div>

                  <p className="text-muted-foreground mb-4">{currentTemplate.description}</p>

                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <p className="text-sm text-foreground">{currentTemplate.preview}</p>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Template
                  </Button>
                </Card>

                {/* Send Test Email */}
                <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                  <h3 className="text-lg font-bold text-foreground mb-4">Send Test Email</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Recipient Email</label>
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="test@example.com"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                      />
                    </div>

                    <Button
                      onClick={handleSendTestEmail}
                      disabled={isLoading}
                      className="w-full bg-cyan-500 hover:bg-cyan-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isLoading ? "Sending..." : "Send Test Email"}
                    </Button>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Select an email template to preview</p>
              </Card>
            )}

            {/* Sent Emails History */}
            {sentEmails.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Recent Test Emails</h3>
                <div className="space-y-2">
                  {sentEmails.map((email, idx) => {
                    const template = EMAIL_TEMPLATES.find((t) => t.id === email.id);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-semibold text-foreground">{template?.name}</p>
                            <p className="text-xs text-muted-foreground">{email.timestamp}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-500/20 text-green-700 text-xs rounded-full">
                          {email.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Email Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <p className="text-sm text-muted-foreground mb-1">Total Sent</p>
            <p className="text-3xl font-bold text-blue-500">12,450</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <p className="text-sm text-muted-foreground mb-1">Delivered</p>
            <p className="text-3xl font-bold text-green-500">12,380</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <p className="text-sm text-muted-foreground mb-1">Open Rate</p>
            <p className="text-3xl font-bold text-purple-500">45.2%</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
            <p className="text-sm text-muted-foreground mb-1">Click Rate</p>
            <p className="text-3xl font-bold text-orange-500">12.8%</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
