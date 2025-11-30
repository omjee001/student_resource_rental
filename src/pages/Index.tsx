import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Package, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Student Resource Rental</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Share Resources, Save Money
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The peer-to-peer platform for college students to rent, lend, and borrow academic resources
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">Start Sharing</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">List Resources</h3>
            <p className="text-muted-foreground">
              Share your books, equipment, and supplies with fellow students
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect & Save</h3>
            <p className="text-muted-foreground">
              Rent from peers at affordable rates and save on academic expenses
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Simple</h3>
            <p className="text-muted-foreground">
              Secure platform with easy request management and tracking
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
