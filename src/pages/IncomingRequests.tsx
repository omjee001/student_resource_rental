import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Inbox, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetIncomingRequests, apiUpdateRequest } from "@/lib/api";

type RequestStatus = "Pending" | "Approved" | "Rejected";

const IncomingRequests = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["incoming-requests"],
    queryFn: apiGetIncomingRequests,
  });
  const incomingRequests = (data?.requests as any[]) || [];

  const updateMutation = useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: "approve" | "reject" }) =>
      apiUpdateRequest(requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
    },
  });

  const handleApprove = (requestId: string) => {
    updateMutation.mutate({ requestId, action: "approve" });
  };

  const handleReject = (requestId: string) => {
    updateMutation.mutate({ requestId, action: "reject" });
  };

  const getStatusBadge = (status: RequestStatus) => {
    const variants: Record<RequestStatus, string> = {
      Pending: "bg-warning/10 text-warning border-warning/20",
      Approved: "bg-success/10 text-success border-success/20",
      Rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };

    return (
      <Badge variant="outline" className={variants[status]}>
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
          <h1 className="text-xl font-bold">Incoming Requests</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Requests for Your Resources</h2>
          <p className="text-muted-foreground">Review and manage rental requests from other students</p>
        </div>

        {isLoading ? (
          <Card className="text-center py-12"><CardContent>Loading...</CardContent></Card>
        ) : error ? (
          <Card className="text-center py-12"><CardContent className="text-red-600">{String((error as Error).message || "Failed to load")}</CardContent></Card>
        ) : incomingRequests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Inbox className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No incoming requests</p>
                <p className="text-muted-foreground">Requests for your resources will appear here</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((request: any) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{request.resource_title || "Resource"}</CardTitle>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex gap-2">
                          <span className="font-medium">Requested by:</span>
                          <span>{request.borrower_email || ""}</span>
                        </div>
                        {request.requestDate && (
                          <div className="flex gap-2">
                            <span className="font-medium">Request Date:</span>
                            <span>{new Date(request.requestDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(request.status || "Pending")}
                  </div>
                </CardHeader>
                {request.status === "Pending" && (
                  <CardFooter className="gap-3">
                    <Button
                      className="flex-1"
                      variant="default"
                      onClick={() => handleApprove(request.id)}
                      disabled={updateMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => handleReject(request.id)}
                      disabled={updateMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default IncomingRequests;
