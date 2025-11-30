import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetMyRequests, apiReturnRequest } from "@/lib/api";
import { toast } from "sonner";

type RequestStatus = "Pending" | "Approved" | "Rejected" | "Returned";

const MyRequests = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-requests"],
    queryFn: apiGetMyRequests,
  });
  const requests = (data?.requests as any[]) || [];

  const queryClient = useQueryClient();
  const returnMutation = useMutation({
    mutationFn: (requestId: string) => apiReturnRequest(requestId),
    onSuccess: (res, requestId) => {
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      navigate("/payment", { state: { requestId, days: res.days, totalDue: res.total_due } });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to return"),
  });

  const getStatusBadge = (status: RequestStatus) => {
    const variants: Record<RequestStatus, string> = {
      Pending: "bg-warning/10 text-warning border-warning/20",
      Approved: "bg-success/10 text-success border-success/20",
      Rejected: "bg-destructive/10 text-destructive border-destructive/20",
      Returned: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <Badge variant="outline" className={variants[status] || "bg-muted text-muted-foreground"}>
        {status}
      </Badge>
    );
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
          <h1 className="text-xl font-bold">My Borrow Requests</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Your Borrow Requests</h2>
          <p className="text-muted-foreground">Track the status of your rental requests</p>
        </div>

        {isLoading ? (
          <Card className="text-center py-12"><CardContent>Loading...</CardContent></Card>
        ) : error ? (
          <Card className="text-center py-12"><CardContent className="text-red-600">{String((error as Error).message || "Failed to load")}</CardContent></Card>
        ) : requests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Send className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No requests yet</p>
                <p className="text-muted-foreground">Browse resources and send your first request</p>
              </div>
              <Button asChild>
                <Link to="/resources">Browse Resources</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request: any) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{request.resource_title || "Resource"}</CardTitle>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex gap-2">
                          <span className="font-medium">Owner:</span>
                          <span>{request.owner_email || ""}</span>
                        </div>
                        {request.requestDate && (
                          <div className="flex gap-2">
                            <span className="font-medium">Request Date:</span>
                            <span>{new Date(request.requestDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status || "Pending")}
                      {request.status === "Approved" && (
                        <Button size="sm" onClick={() => returnMutation.mutate(request.id)}>Return</Button>
                      )}
                      {request.status === "Returned" && (
                        <span className="text-sm text-muted-foreground">Due: ₹{Number(request.total_due || 0).toFixed(2)} (Cash/UPI)</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRequests;
