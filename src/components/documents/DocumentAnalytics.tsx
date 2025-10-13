import { useMemo } from "react";
import { BarChart, FileText, Folder, Tag, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Document {
  id: string;
  category: string;
  file_size: number;
  file_type: string;
  tags: string[];
  uploaded_at: string;
  folder_id?: string | null;
}

interface DocumentAnalyticsProps {
  documents: Document[];
}

export function DocumentAnalytics({ documents }: DocumentAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.file_size, 0);
    const categoryCount = documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCount = documents.reduce((acc, doc) => {
      const type = doc.file_type.split("/")[0] || "other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const allTags = documents.flatMap((doc) => doc.tags);
    const tagCount = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const folderedDocs = documents.filter((doc) => doc.folder_id).length;
    const unorganizedDocs = documents.length - folderedDocs;

    // Upload trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUploads = documents.filter(
      (doc) => new Date(doc.uploaded_at) >= thirtyDaysAgo
    ).length;

    return {
      totalDocuments: documents.length,
      totalSize,
      categoryCount,
      typeCount,
      topTags,
      folderedDocs,
      unorganizedDocs,
      recentUploads,
    };
  }, [documents]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPercentage = (count: number) => {
    return ((count / analytics.totalDocuments) * 100).toFixed(1);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BarChart className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Analytics</DialogTitle>
          <DialogDescription>
            Insights and statistics about your document collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">
                    {analytics.totalDocuments}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {formatFileSize(analytics.totalSize)}
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recent Uploads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-2xl font-bold">
                    {analytics.recentUploads}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (30 days)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-blue-500" />
                  <span className="text-2xl font-bold">
                    {getPercentage(analytics.folderedDocs)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  in folders
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(analytics.categoryCount)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <span className="text-muted-foreground">
                        {count} ({getPercentage(count)}%)
                      </span>
                    </div>
                    <Progress
                      value={(count / analytics.totalDocuments) * 100}
                    />
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* File Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents by File Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(analytics.typeCount)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{type}</span>
                      <span className="text-muted-foreground">
                        {count} ({getPercentage(count)}%)
                      </span>
                    </div>
                    <Progress
                      value={(count / analytics.totalDocuments) * 100}
                    />
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Top Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Most Used Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.topTags.map(([tag, count]) => (
                  <div
                    key={tag}
                    className="px-3 py-1 bg-primary/10 rounded-full text-sm flex items-center gap-2"
                  >
                    <span>{tag}</span>
                    <span className="text-xs text-muted-foreground">
                      ({count})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
