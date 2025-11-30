import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Package, Trash2, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGetMyResources } from "@/lib/api";

const MyResources = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-resources"],
    queryFn: apiGetMyResources,
  });
  const myResources = (data?.resources as any[]) || [];

  const categoryColors: Record<string, string> = {
    books: "bg-primary/10 text-primary",
    electronics: "bg-accent/10 text-accent",
    "lab-equipment": "bg-success/10 text-success",
    stationery: "bg-warning/10 text-warning",
    other: "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">My Resources</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Listed Resources</h2>
            <p className="text-muted-foreground">Manage the items you've listed for rent</p>
          </div>
          <Button asChild>
            <Link to="/add-resource">Add New Resource</Link>
          </Button>
        </div>

        {isLoading ? (
          <Card className="text-center py-12"><CardContent>Loading...</CardContent></Card>
        ) : error ? (
          <Card className="text-center py-12"><CardContent className="text-red-600">{String((error as Error).message || "Failed to load")}</CardContent></Card>
        ) : myResources.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Package className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No resources listed yet</p>
                <p className="text-muted-foreground">Start sharing your resources with the community</p>
              </div>
              <Button asChild>
                <Link to="/add-resource">Add Your First Resource</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myResources.map((resource: any) => (
              <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {resource.image ? (
                    <img src={`/uploads/${resource.image}`} alt={resource.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-1">{resource.title}</CardTitle>
                    <Badge variant="secondary" className={categoryColors[resource.category] || "bg-muted text-muted-foreground"}>
                      {resource.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">${resource.price}/day</span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyResources;
