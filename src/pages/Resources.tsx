import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetResources, apiCreateRequest } from "@/lib/api";
import { toast } from "sonner";

const Resources = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["resources"],
    queryFn: apiGetResources,
  });
  const resources = (data?.resources as any[]) || [];

  // No longer disabling after return; re-request is allowed

  const requestMutation = useMutation({
    mutationFn: apiCreateRequest,
    onSuccess: () => {
      toast.success("Request sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send request");
    },
  });

  const handleRequest = (resourceId: string) => {
    requestMutation.mutate(resourceId);
  };

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
          <h1 className="text-xl font-bold">All Resources</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Available Resources</h2>
          <p className="text-muted-foreground">Browse and request resources from fellow students</p>
        </div>

        {isLoading ? (
          <Card className="text-center py-12"><CardContent>Loading resources...</CardContent></Card>
        ) : error ? (
          <Card className="text-center py-12"><CardContent className="text-red-600">{String((error as Error).message || "Failed to load")}</CardContent></Card>
        ) : resources.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Package className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No resources available</p>
                <p className="text-muted-foreground">Be the first to add a resource!</p>
              </div>
              <Button asChild>
                <Link to="/add-resource">Add Resource</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource: any) => (
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
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold">${resource.price}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-medium">{resource.owner_email || ""}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleRequest(resource.id)}
                    disabled={requestMutation.isPending}
                  >
                    {requestMutation.isPending ? "Sending..." : "Request to Borrow"}
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

export default Resources;
