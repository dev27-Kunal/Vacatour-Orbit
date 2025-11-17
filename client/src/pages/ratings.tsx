import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, ThumbsUp, MessageSquare, TrendingUp, Award } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { PageWrapper } from "@/components/page-wrapper";
import { useTranslation } from "react-i18next";

const ratingSchema = z.object({
  applicationId: z.string().min(1, "Application ID is verplicht"),
  toUserId: z.string().min(1, "Gebruiker is verplicht"),
  score: z.number().min(1, "Score moet minimaal 1 zijn").max(5, "Score mag maximaal 5 zijn"),
  comment: z.string().optional(),
});

type RatingFormData = z.infer<typeof ratingSchema>;

export default function RatingsPage() {
  const [selectedRating, setSelectedRating] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      applicationId: "",
      toUserId: "",
      score: 5,
      comment: "",
    },
  });

  // Get ratings received
  const { data: receivedRatings, isLoading: receivedLoading } = useQuery({
    queryKey: ["/api/ratings", "received"],
    queryFn: async () => {
      const response = await apiGet<{
        ratings: Array<{
          score: number;
          comment?: string;
          createdAt: string;
          fromUser?: { name: string };
          application?: { jobId: string };
        }>;
        averageRating: number;
      }>("/api/ratings", { type: "received" });

      if (!response.success) {
        console.error('Failed to fetch received ratings:', response.error);
        throw new Error(response.error || 'Failed to fetch received ratings');
      }

      // Ensure data structure is correct
      return response.data || { ratings: [], averageRating: 0 };
    },
  });

  // Get ratings given
  const { data: givenRatings, isLoading: givenLoading } = useQuery({
    queryKey: ["/api/ratings", "given"],
    queryFn: async () => {
      const response = await apiGet<{
        ratings: Array<{
          score: number;
          comment?: string;
          createdAt: string;
          toUser?: { name: string };
          application?: { jobId: string };
        }>;
        averageRating: number;
      }>("/api/ratings", { type: "given" });

      if (!response.success) {
        console.error('Failed to fetch given ratings:', response.error);
        throw new Error(response.error || 'Failed to fetch given ratings');
      }

      // Ensure data structure is correct
      return response.data || { ratings: [], averageRating: 0 };
    },
  });

  // Get completed applications for rating
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/v2/applications", "completed"],
    queryFn: async () => {
      const response = await apiGet<Array<{
        id: string;
        candidateName: string;
        jobTitle: string;
        userId: string;
      }>>("/api/v2/applications/my-applications", { status: "PLACED" });

      if (!response.success) {
        console.error('Failed to fetch applications:', response.error);
        throw new Error(response.error || 'Failed to fetch applications');
      }

      // Ensure data structure is correct
      return response.data || [];
    },
  });

  // Create rating mutation
  const createRatingMutation = useMutation({
    mutationFn: async (data: RatingFormData) => {
      const response = await apiPost<{ success: boolean }>("/api/ratings", data);

      if (!response.success) {
        throw new Error(response.error || "Failed to create rating");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratings"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: t("success.created"),
        description: t("addReview.submitReview") + " " + t("success.saved").toLowerCase(),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("errors.general"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = receivedLoading || givenLoading || applicationsLoading;

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">{t("navigation.ratings")}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse feature-card bg-card">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const received = receivedRatings || { ratings: [], averageRating: 0 };
  const given = givenRatings || { ratings: [], averageRating: 0 };
  const completedApplications = applications || [];

  const totalRatings = received.ratings.length;
  const averageRating = received.averageRating;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(score => {
    const count = received.ratings.filter((r: any) => r.score === score).length;
    const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
    return { score, count, percentage };
  });

  const onSubmit = (data: RatingFormData) => {
    createRatingMutation.mutate(data);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("navigation.ratings")}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-rating">
                <Star className="h-4 w-4 mr-2" />
                {t("addReview.addReview")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("addReview.addReview")}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="applicationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("addReview.selectApplication")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-application" className="w-full">
                              <SelectValue placeholder={t("addReview.selectApplication")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent >
                            {completedApplications.length > 0 ? (
                              completedApplications.map((app: any) => (
                                <SelectItem key={app.id} value={app.id}>
                                  {app.candidateName} - {app.jobTitle}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-applications" disabled>
                                {t("addReview.noApplicationsFound")}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {completedApplications.length === 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("addReview.noApplicationsMessage")}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toUserId"
                    render={({ field }) => {
                      // Extract unique users from completed applications
                      const uniqueUsers = completedApplications.length > 0
                        ? Array.from(
                            new Map(
                              completedApplications.map((app: any) => [
                                app.userId,
                                { id: app.userId, name: app.candidateName }
                              ])
                            ).values()
                          )
                        : [];

                      return (
                        <FormItem>
                          <FormLabel>{t("addReview.selectUser")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-user" className="w-full">
                                <SelectValue placeholder={t("addReview.selectUser")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent >
                              {uniqueUsers.length > 0 ? (
                                uniqueUsers.map((user: any) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-users" disabled>
                                  {t("addReview.noApplicationsFound")}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("addReview.ratingScore")}</FormLabel>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Button
                              key={star}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="p-1"
                              onClick={() => field.onChange(star)}
                              data-testid={`star-${star}`}
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= field.value
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            </Button>
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">{field.value}/5</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("addReview.comment")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("addReview.comment")}
                            {...field}
                            data-testid="textarea-comment"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={createRatingMutation.isPending || completedApplications.length === 0}
                      data-testid="button-submit-rating"
                    >
                      {createRatingMutation.isPending ? t("common.loading") : t("addReview.submitReview")}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rating Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="feature-card bg-card" data-testid="card-average-rating">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("applications.averageRating", "Average Rating")}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {averageRating.toFixed(1)} <span className="text-sm text-muted-foreground">/ 5.0</span>
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card bg-card" data-testid="card-total-ratings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("applications.totalRatings", "Total Ratings")}</p>
                  <p className="text-2xl font-bold text-foreground">{totalRatings}</p>
                </div>
                <ThumbsUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card bg-card" data-testid="card-given-ratings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("applications.givenRatings", "Given Ratings")}</p>
                  <p className="text-2xl font-bold text-foreground">{given.ratings.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card bg-card" data-testid="card-rating-trend">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("applications.ratingTrend", "Rating Trend")}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {averageRating >= 4.5 ? "🚀" : averageRating >= 4.0 ? "📈" : averageRating >= 3.0 ? "📊" : "📉"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="received" data-testid="tab-received">{t("applications.received", "Received")}</TabsTrigger>
            <TabsTrigger value="given" data-testid="tab-given">{t("applications.given", "Given")}</TabsTrigger>
            <TabsTrigger value="overview" data-testid="tab-overview">{t("applications.overview", "Overview")}</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-6">
            <Card className="feature-card bg-card" data-testid="card-received-ratings">
              <CardHeader>
                <CardTitle>{t("applications.receivedRatings", "Received Ratings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {received.ratings.length > 0 ? (
                    received.ratings.map((rating: any, index: number) => (
                      <div key={index} className="p-4 bg-background rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < rating.score ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{rating.fromUser?.name || t('ratings.unknownUser')}</span>
                              <Badge variant="outline">{t('ratings.score')}: {rating.score}/5</Badge>
                            </div>
                            {rating.comment && (
                              <p className="text-gray-700 mb-2">{rating.comment}</p>
                            )}
                            <p className="text-sm text-gray-500">
                              {t('ratings.job')}: {rating.application?.jobId || t('ratings.unknownJob')} • {rating.createdAt ? format(new Date(rating.createdAt), 'dd MMM yyyy', { locale: nl }) : t('ratings.unknownDate')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">{t("applications.noRatingsReceived", "No ratings received yet")}</h3>
                      <p className="text-gray-600">{t("applications.noRatingsReceivedMessage", "You will receive ratings when your collaboration with clients is completed.")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="given" className="space-y-6">
            <Card className="feature-card bg-card" data-testid="card-given-ratings">
              <CardHeader>
                <CardTitle>{t("applications.givenRatings", "Given Ratings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {given.ratings.length > 0 ? (
                    given.ratings.map((rating: any, index: number) => (
                      <div key={index} className="p-4 bg-background rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < rating.score ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{t('ratings.to')}: {rating.toUser?.name || t('ratings.unknownUser')}</span>
                              <Badge variant="outline">{t('ratings.score')}: {rating.score}/5</Badge>
                            </div>
                            {rating.comment && (
                              <p className="text-gray-700 mb-2">{rating.comment}</p>
                            )}
                            <p className="text-sm text-gray-500">
                              {t('ratings.job')}: {rating.application?.jobId || t('ratings.unknownJob')} • {rating.createdAt ? format(new Date(rating.createdAt), 'dd MMM yyyy', { locale: nl }) : t('ratings.unknownDate')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">{t("applications.noRatingsGiven", "No ratings given yet")}</h3>
                      <p className="text-gray-600">{t("applications.noRatingsGivenMessage", "Give ratings to users you have collaborated with.")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="feature-card bg-card" data-testid="card-rating-distribution">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {t("applications.ratingDistribution", "Rating Distribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ratingDistribution.map(({ score, count, percentage }) => (
                      <div key={score} className="flex items-center gap-3">
                        <span className="w-8 text-sm font-medium">{score}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card bg-card" data-testid="card-rating-insights">
                <CardHeader>
                  <CardTitle>{t("applications.ratingInsights", "Rating Insights")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">{t('ratings.positiveReviews')}</span>
                      <span className="text-sm font-bold text-green-800">
                        {totalRatings > 0 ? Math.round((received.ratings.filter((r: any) => r.score >= 4).length / totalRatings) * 100) : 0}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-800">{t('ratings.neutralReviews')}</span>
                      <span className="text-sm font-bold text-yellow-800">
                        {totalRatings > 0 ? Math.round((received.ratings.filter((r: any) => r.score === 3).length / totalRatings) * 100) : 0}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-800">{t('ratings.negativeReviews')}</span>
                      <span className="text-sm font-bold text-red-800">
                        {totalRatings > 0 ? Math.round((received.ratings.filter((r: any) => r.score <= 2).length / totalRatings) * 100) : 0}%
                      </span>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        💡 <strong>{t('ratings.tip')}:</strong> {t('ratings.tipMessage')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </PageWrapper>
  );
}