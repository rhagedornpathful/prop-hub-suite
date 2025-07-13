import { useState, useEffect } from "react";
import { Plus, Upload, Search, Filter, Download, Trash2, Eye, FileText, Image, Video, Archive, Home, User, Users } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/integrations/supabase/types";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  tags: string[];
  description?: string;
  uploaded_at: string;
  property_id?: string;
  property_owner_id?: string;
  tenant_id?: string;
  maintenance_request_id?: string;
  // Populated from joins
  property?: { address: string; id: string };
  property_owner?: { first_name: string; last_name: string; id: string };
  tenant?: { first_name: string; last_name: string; id: string };
  maintenance_request?: { title: string; id: string };
}

type Property = Tables<'properties'>;
type PropertyOwner = Tables<'property_owners'>;
type Tenant = Tables<'tenants'>;

interface PropertyOption {
  id: string;
  address: string;
}

interface PropertyOwnerOption {
  id: string;
  first_name: string;
  last_name: string;
}

interface TenantOption {
  id: string;
  first_name: string;
  last_name: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [propertyOwners, setPropertyOwners] = useState<PropertyOwnerOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [associationFilter, setAssociationFilter] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("general");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedPropertyOwnerId, setSelectedPropertyOwnerId] = useState<string>("");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: "general", label: "General" },
    { value: "contracts", label: "Contracts" },
    { value: "invoices", label: "Invoices" },
    { value: "reports", label: "Reports" },
    { value: "photos", label: "Photos" },
    { value: "maintenance", label: "Maintenance" },
    { value: "legal", label: "Legal" },
  ];

  useEffect(() => {
    fetchDocuments();
    fetchRelatedData();
  }, []);

  const fetchRelatedData = async () => {
    try {
      const [propertiesData, ownersData, tenantsData] = await Promise.all([
        supabase.from('properties').select('id, address').order('address'),
        supabase.from('property_owners').select('id, first_name, last_name').order('first_name'),
        supabase.from('tenants').select('id, first_name, last_name').order('first_name')
      ]);

      if (propertiesData.data) setProperties(propertiesData.data);
      if (ownersData.data) setPropertyOwners(ownersData.data);
      if (tenantsData.data) setTenants(tenantsData.data);
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          property:properties(id, address),
          property_owner:property_owners(id, first_name, last_name),
          tenant:tenants(id, first_name, last_name),
          maintenance_request:maintenance_requests(id, title)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const fileName = `${Date.now()}-${uploadFile.name}`;
      const filePath = `${userData.user.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userData.user.id,
          file_name: uploadFile.name,
          file_path: filePath,
          file_size: uploadFile.size,
          file_type: uploadFile.type,
          category: uploadCategory,
          tags: uploadTags.split(',').map(tag => tag.trim()).filter(Boolean),
          description: uploadDescription || null,
          property_id: selectedPropertyId || null,
          property_owner_id: selectedPropertyOwnerId || null,
          tenant_id: selectedTenantId || null,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      resetUploadForm();
      fetchDocuments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setIsUploadDialogOpen(false);
    setUploadFile(null);
    setUploadDescription("");
    setUploadTags("");
    setUploadCategory("general");
    setSelectedPropertyId("");
    setSelectedPropertyOwnerId("");
    setSelectedTenantId("");
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      fetchDocuments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-5 h-5" />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <Archive className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    
    let matchesAssociation = true;
    switch (associationFilter) {
      case "with-property":
        matchesAssociation = !!doc.property_id;
        break;
      case "with-owner":
        matchesAssociation = !!doc.property_owner_id;
        break;
      case "with-tenant":
        matchesAssociation = !!doc.tenant_id;
        break;
      case "unassociated":
        matchesAssociation = !doc.property_id && !doc.property_owner_id && !doc.tenant_id && !doc.maintenance_request_id;
        break;
      default:
        matchesAssociation = true;
    }
    
    return matchesSearch && matchesCategory && matchesAssociation;
  });

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload a new document to your collection
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file">Select File</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={uploadCategory} onValueChange={setUploadCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Optional description..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={uploadTags}
                        onChange={(e) => setUploadTags(e.target.value)}
                        placeholder="Comma-separated tags..."
                        className="mt-1"
                      />
                    </div>

                    {/* Association Fields */}
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-medium">Associate with:</h4>
                      
                      <div>
                        <Label htmlFor="property">Property (Optional)</Label>
                        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a property..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {properties.map(property => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.address}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="propertyOwner">Property Owner (Optional)</Label>
                        <Select value={selectedPropertyOwnerId} onValueChange={setSelectedPropertyOwnerId}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a property owner..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {propertyOwners.map(owner => (
                              <SelectItem key={owner.id} value={owner.id}>
                                {owner.first_name} {owner.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="tenant">Tenant (Optional)</Label>
                        <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a tenant..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {tenants.map(tenant => (
                              <SelectItem key={tenant.id} value={tenant.id}>
                                {tenant.first_name} {tenant.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleFileUpload} 
                      disabled={!uploadFile || isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={associationFilter} onValueChange={setAssociationFilter}>
                <SelectTrigger className="w-[180px]">
                  <Users className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="with-property">With Property</SelectItem>
                  <SelectItem value="with-owner">With Owner</SelectItem>
                  <SelectItem value="with-tenant">With Tenant</SelectItem>
                  <SelectItem value="unassociated">Unassociated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(document.file_type)}
                        <CardTitle className="text-sm font-medium truncate">
                          {document.file_name}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.value === document.category)?.label || document.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {document.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {document.description}
                        </p>
                      )}
                      
                      {/* Association badges */}
                      {(document.property || document.property_owner || document.tenant || document.maintenance_request) && (
                        <div className="flex flex-wrap gap-1">
                          {document.property && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Home className="w-3 h-3" />
                              {document.property.address}
                            </Badge>
                          )}
                          {document.property_owner && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {document.property_owner.first_name} {document.property_owner.last_name}
                            </Badge>
                          )}
                          {document.tenant && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {document.tenant.first_name} {document.tenant.last_name}
                            </Badge>
                          )}
                          {document.maintenance_request && (
                            <Badge variant="outline" className="text-xs">
                              Maintenance: {document.maintenance_request.title}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {document.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(document.file_size)}</span>
                        <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(document)}
                          className="flex-1"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(document)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No documents found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || categoryFilter !== "all" 
                    ? "Try adjusting your search or filter criteria" 
                    : "Upload your first document to get started"}
                </p>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </div>
  );
}