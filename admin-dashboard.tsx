import { useState } from "react";
import { Link } from "wouter";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Appointment {
  id: number;
  customerId: number;
  packageId: number;
  appointmentDate: string;
  status: string;
  notes: string;
  createdAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  package?: {
    name: string;
    price: string;
  };
}

interface Payment {
  id: number;
  appointmentId: number;
  amount: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    isActive: true
  });

  const { toast } = useToast();

  // Fetch appointments with filters
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments', appointmentFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (appointmentFilter !== 'all') {
        params.append('status', appointmentFilter);
      }
      params.append('limit', '100');
      return apiRequest(`/api/appointments?${params.toString()}`);
    }
  });

  // Fetch payments with filters
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/payments', paymentFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (paymentFilter !== 'all') {
        params.append('status', paymentFilter);
      }
      params.append('limit', '100');
      return apiRequest(`/api/payments?${params.toString()}`);
    }
  });

  // Fetch service packages
  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['/api/packages'],
    queryFn: () => apiRequest('/api/packages')
  });

  // Fetch monthly report
  const currentDate = new Date();
  const { data: monthlyReport, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/reports/monthly', currentDate.getFullYear(), currentDate.getMonth() + 1],
    queryFn: () => apiRequest(`/api/reports/monthly?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`)
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: async (packageData: any) => {
      return await apiRequest('/api/packages', {
        method: 'POST',
        body: JSON.stringify({
          ...packageData,
          price: packageData.price.toString(),
          duration: parseInt(packageData.duration)
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      setNewPackage({ name: "", description: "", price: "", duration: "", isActive: true });
      toast({
        title: "Başarılı",
        description: "Yeni paket oluşturuldu",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Paket oluşturulurken bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  // Update appointment status mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest(`/api/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Başarılı",
        description: "Randevu durumu güncellendi",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Randevu güncellenirken bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Bekliyor</Badge>;
      case 'confirmed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Onaylandı</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Tamamlandı</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">İptal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Bekliyor</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Ödendi</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Başarısız</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-fit">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Randevular
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Ödemeler
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Paketler
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Müşteriler
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Randevular</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReport?.totalAppointments || 0}</div>
                  <p className="text-xs text-gray-600">Bu ay</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                  <CreditCard className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₺{monthlyReport?.totalRevenue || 0}</div>
                  <p className="text-xs text-gray-600">Bu ay</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReport?.completedAppointments || 0}</div>
                  <p className="text-xs text-gray-600">Randevu</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReport?.pendingAppointments || 0}</div>
                  <p className="text-xs text-gray-600">Randevu</p>
                </CardContent>
              </Card>
            </div>

            {/* Package Performance */}
            {monthlyReport?.appointmentsByPackage && (
              <Card>
                <CardHeader>
                  <CardTitle>Paket Performansı</CardTitle>
                  <CardDescription>Bu ayki paket bazlı randevu ve gelir dağılımı</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyReport.appointmentsByPackage.map((item: any) => (
                      <div key={item.packageName} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.packageName}</p>
                          <p className="text-sm text-gray-600">{item.count} randevu</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₺{item.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Randevular</h2>
              <div className="flex items-center space-x-4">
                <Select value={appointmentFilter} onValueChange={setAppointmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Durum filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="confirmed">Onaylandı</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead>Tarih & Saat</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointmentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Randevular yükleniyor...</p>
                        </TableCell>
                      </TableRow>
                    ) : appointments?.length > 0 ? (
                      appointments.map((appointment: Appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {appointment.customer?.firstName} {appointment.customer?.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{appointment.customer?.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.package?.name}</TableCell>
                          <TableCell>
                            {new Date(appointment.appointmentDate).toLocaleString('tr-TR')}
                          </TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          <TableCell>₺{appointment.package?.price}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Select
                                value={appointment.status}
                                onValueChange={(status) => 
                                  updateAppointmentMutation.mutate({ 
                                    id: appointment.id, 
                                    status 
                                  })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Bekliyor</SelectItem>
                                  <SelectItem value="confirmed">Onayla</SelectItem>
                                  <SelectItem value="completed">Tamamla</SelectItem>
                                  <SelectItem value="cancelled">İptal Et</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Henüz randevu bulunmuyor
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Ödemeler</h2>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Durum filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                  <SelectItem value="completed">Ödendi</SelectItem>
                  <SelectItem value="failed">Başarısız</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Randevu ID</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Ödeme Yöntemi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Ödemeler yükleniyor...</p>
                        </TableCell>
                      </TableRow>
                    ) : payments?.length > 0 ? (
                      payments.map((payment: Payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>#{payment.appointmentId}</TableCell>
                          <TableCell className="font-medium">₺{payment.amount}</TableCell>
                          <TableCell>
                            {payment.paymentMethod === 'bank_transfer' && 'Banka Havalesi'}
                            {payment.paymentMethod === 'eft' && 'EFT'}
                            {payment.paymentMethod === 'paytr' && 'PayTR'}
                          </TableCell>
                          <TableCell>{getPaymentStatusBadge(payment.paymentStatus)}</TableCell>
                          <TableCell>
                            {new Date(payment.createdAt).toLocaleDateString('tr-TR')}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Henüz ödeme bulunmuyor
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Hizmet Paketleri</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Paket
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Hizmet Paketi</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="packageName">Paket Adı</Label>
                      <Input
                        id="packageName"
                        value={newPackage.name}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Paket adını girin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="packageDescription">Açıklama</Label>
                      <Textarea
                        id="packageDescription"
                        value={newPackage.description}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Paket açıklamasını girin"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="packagePrice">Fiyat (₺)</Label>
                        <Input
                          id="packagePrice"
                          type="number"
                          value={newPackage.price}
                          onChange={(e) => setNewPackage(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="299"
                        />
                      </div>
                      <div>
                        <Label htmlFor="packageDuration">Süre (dakika)</Label>
                        <Input
                          id="packageDuration"
                          type="number"
                          value={newPackage.duration}
                          onChange={(e) => setNewPackage(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="60"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={() => createPackageMutation.mutate(newPackage)}
                      disabled={createPackageMutation.isPending}
                      className="w-full"
                    >
                      {createPackageMutation.isPending ? "Oluşturuluyor..." : "Paketi Oluştur"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {packagesLoading ? (
                <div className="col-span-3 text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Paketler yükleniyor...</p>
                </div>
              ) : packages?.length > 0 ? (
                packages.map((pkg: any) => (
                  <Card key={pkg.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <CardDescription>{pkg.description}</CardDescription>
                        </div>
                        <Badge variant={pkg.isActive ? "default" : "secondary"}>
                          {pkg.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fiyat:</span>
                          <span className="font-bold text-blue-600">₺{pkg.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Süre:</span>
                          <span>{pkg.duration} dakika</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          {pkg.isActive ? "Pasifleştir" : "Aktifleştir"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  Henüz paket bulunmuyor
                </div>
              )}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Müşteriler</h2>
              <div className="flex items-center space-x-4">
                <Input placeholder="Müşteri ara..." className="w-64" />
                <Button variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Ara
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500 py-8">
                  Müşteri listesi yakında eklenecek...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}