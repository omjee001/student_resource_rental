import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Package, Send, Inbox, LogOut, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGetIncomingPendingCount, apiGetMe } from "@/lib/api";

const Dashboard = () => {
  const { data: userData } = useQuery({
    queryKey: ["me"],
    queryFn: apiGetMe,
    retry: false,
  });
  const userName = userData?.name || "Student";
  
  const { data: incomingCountData } = useQuery({
    queryKey: ["incoming-pending-count"],
    queryFn: apiGetIncomingPendingCount,
  });
  const pendingCount = incomingCountData?.count || 0;

  const dashboardCards = [
    {
      title: "Add Resource",
      description: "List a new resource for rent",
      icon: Plus,
      link: "/add-resource",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "View All Resources",
      description: "Browse available resources",
      icon: Eye,
      link: "/resources",
      color: "bg-accent/10 text-accent",
    },
    {
      title: "My Resources",
      description: "Manage your uploaded items",
      icon: Package,
      link: "/my-resources",
      color: "bg-success/10 text-success",
    },
    {
      title: "My Borrow Requests",
      description: "Track your rental requests",
      icon: Send,
      link: "/my-requests",
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Incoming Requests",
      description: "Review requests for your items",
      icon: Inbox,
      link: "/incoming-requests",
      color: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Student Resource Rental</h1>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {userName} 👋</h2>
          <p className="text-muted-foreground">Manage your resources and rentals from here</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link to={card.link} key={card.title} className="relative block">
                <Card className="h-full hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                </Card>
                {card.title === "Incoming Requests" && pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
