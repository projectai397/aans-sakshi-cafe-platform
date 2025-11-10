import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, MapPin, Phone, Mail, Clock, Users, Briefcase, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function NewsCareerContact() {
  const [activeTab, setActiveTab] = useState<"news" | "careers" | "contact">("news");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      toast.success("Thank you! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const pressReleases = [
    {
      date: "Nov 2025",
      title: "AANS Launches SubCircle: Sustainable Fashion Platform",
      excerpt: "Revolutionary secondhand marketplace connecting Gen Z consumers with sustainable fashion and underground culture.",
      category: "Product Launch"
    },
    {
      date: "Oct 2025",
      title: "AANS Secures ₹50 Crore Series A Funding",
      excerpt: "Led by prominent venture capital firms, funding will accelerate growth across all three divisions.",
      category: "Funding"
    },
    {
      date: "Sep 2025",
      title: "AANS Expands Engineering Team by 100+ Hires",
      excerpt: "Strategic hiring to strengthen product development and infrastructure capabilities.",
      category: "Company News"
    },
    {
      date: "Aug 2025",
      title: "Sakshi Wellness Platform Hits 50,000 Active Users",
      excerpt: "Milestone achievement in building conscious wellness community across India.",
      category: "Milestone"
    },
  ];

  const jobListings = [
    {
      title: "Senior Software Engineer - Backend",
      department: "Engineering",
      location: "Bangalore",
      type: "Full-time",
      level: "Senior"
    },
    {
      title: "Product Manager - AVE Division",
      department: "Product",
      location: "Bangalore",
      type: "Full-time",
      level: "Mid-level"
    },
    {
      title: "Data Scientist",
      department: "Analytics",
      location: "Bangalore",
      type: "Full-time",
      level: "Senior"
    },
    {
      title: "Sales Executive - Enterprise",
      department: "Sales",
      location: "Mumbai",
      type: "Full-time",
      level: "Mid-level"
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Bangalore",
      type: "Full-time",
      level: "Mid-level"
    },
    {
      title: "Content Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      level: "Mid-level"
    },
  ];

  const offices = [
    {
      city: "Bangalore",
      address: "123 Tech Park, Whitefield, Bangalore - 560066",
      phone: "+91-80-XXXX-XXXX",
      email: "bangalore@aans.com",
      hours: "9:00 AM - 6:00 PM IST"
    },
    {
      city: "Mumbai",
      address: "456 Business Bay, Bandra, Mumbai - 400050",
      phone: "+91-22-XXXX-XXXX",
      email: "mumbai@aans.com",
      hours: "9:00 AM - 6:00 PM IST"
    },
    {
      city: "Delhi",
      address: "789 Corporate Plaza, Gurgaon, Delhi - 122001",
      phone: "+91-124-XXXX-XXXX",
      email: "delhi@aans.com",
      hours: "9:00 AM - 6:00 PM IST"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/company" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-xl">AANS</span>
          </Link>
          <Link href="/company">
            <Button variant="ghost" size="sm">Back</Button>
          </Link>
        </div>
      </nav>

      {/* Tab Navigation */}
      <section className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex gap-4">
          {[
            { id: "news", label: "News & Media", icon: "📰" },
            { id: "careers", label: "Careers", icon: "💼" },
            { id: "contact", label: "Contact", icon: "📧" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* News & Media Section */}
      {activeTab === "news" && (
        <section className="py-20">
          <div className="container max-w-4xl">
            <h2 className="text-4xl font-bold mb-12">News & Media Hub</h2>

            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">Latest Press Releases</h3>
              <div className="space-y-6">
                {pressReleases.map((release, idx) => (
                  <Card key={idx} className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary/20 text-primary">{release.category}</Badge>
                            <span className="text-sm text-muted-foreground">{release.date}</span>
                          </div>
                          <CardTitle className="text-xl">{release.title}</CardTitle>
                          <CardDescription className="mt-2">{release.excerpt}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" variant="outline" className="gap-2">
                        Read More <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="border-primary/20 bg-card/30">
              <CardHeader>
                <CardTitle>Company Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Milestones Achieved</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 1,180+ team members across India</li>
                    <li>• ₹114 Crores in revenue (FY 2024-25)</li>
                    <li>• 50,000+ active users on Sakshi</li>
                    <li>• 100+ enterprise clients using AVE</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Upcoming Events</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• AANS Tech Summit 2025 - December</li>
                    <li>• SubCircle Fashion Week - January 2026</li>
                    <li>• Sakshi Wellness Retreat - February 2026</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Careers Section */}
      {activeTab === "careers" && (
        <section className="py-20">
          <div className="container max-w-4xl">
            <h2 className="text-4xl font-bold mb-12">Join Our Team</h2>

            <Card className="border-primary/20 mb-12 bg-card/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Why Work at AANS?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { title: "Innovative Culture", desc: "Work on cutting-edge AI and conscious business solutions" },
                    { title: "Growth Opportunities", desc: "Fast-growing company with clear career progression paths" },
                    { title: "Great Benefits", desc: "Competitive salary, health insurance, stock options, and more" },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-2xl font-bold mb-6">Open Positions</h3>
              <div className="space-y-4">
                {jobListings.map((job, idx) => (
                  <Card key={idx} className="border-accent/20 hover:border-accent/40 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline">{job.department}</Badge>
                            <Badge variant="outline">{job.location}</Badge>
                            <Badge variant="outline">{job.type}</Badge>
                            <Badge className="bg-primary/20 text-primary">{job.level}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" className="gap-2">
                        Apply Now <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {activeTab === "contact" && (
        <section className="py-20">
          <div className="container max-w-4xl">
            <h2 className="text-4xl font-bold mb-12">Contact Us</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Office Locations */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Office Locations</h3>
                <div className="space-y-6">
                  {offices.map((office, idx) => (
                    <Card key={idx} className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          {office.city}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Address</p>
                          <p className="font-semibold text-sm">{office.address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <a href={`tel:${office.phone}`} className="text-sm hover:text-primary">
                            {office.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <a href={`mailto:${office.email}`} className="text-sm hover:text-primary">
                            {office.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm">{office.hours}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Name</label>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Email</label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Message</label>
                        <textarea
                          placeholder="Your message..."
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary resize-none"
                        />
                      </div>
                      <Button type="submit" className="w-full gap-2">
                        <MessageSquare className="h-4 w-4" /> Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Links */}
            <Card className="border-accent/20 bg-card/30">
              <CardHeader>
                <CardTitle>Other Ways to Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { title: "General Inquiries", email: "hello@aans.com" },
                    { title: "Sales & Partnerships", email: "sales@aans.com" },
                    { title: "Careers", email: "careers@aans.com" },
                  ].map((contact, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold mb-2">{contact.title}</h4>
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline text-sm">
                        {contact.email}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 AANS - Autonomous AI Neural System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
