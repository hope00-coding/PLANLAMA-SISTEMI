import { useState } from "react";
import { Link } from "wouter";
import { Calendar, Clock, User, Phone, Mail, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ServicePackage {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  isActive: boolean;
}

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface BookingForm {
  customer: Customer;
  packageId: number;
  appointmentDate: string;
  timeSlot: string;
  notes: string;
  paymentMethod: 'bank_transfer' | 'eft' | 'paytr';
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    customer: {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    },
    packageId: 0,
    appointmentDate: "",
    timeSlot: "",
    notes: "",
    paymentMethod: 'bank_transfer'
  });

  const { toast } = useToast();

  // Fetch service packages
  const { data: packages, isLoading: packagesLoading, error: packagesError } = useQuery({
    queryKey: ['/api/packages'],
    queryFn: () => apiRequest('/api/packages'),
    retry: 1
  });

  // Debug packages
  console.log("Packages data:", packages);
  console.log("Packages loading:", packagesLoading);
  console.log("Packages error:", packagesError);

  // Fetch available time slots
  const { data: timeSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['/api/appointments/available-slots', selectedDate, selectedPackage?.id],
    queryFn: () => apiRequest(`/api/appointments/available-slots?date=${selectedDate}&packageId=${selectedPackage?.id}`),
    enabled: !!selectedDate && !!selectedPackage?.id
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      return await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
    },
    onSuccess: (appointment) => {
      // Create payment record
      createPaymentMutation.mutate({
        appointmentId: appointment.id,
        amount: selectedPackage?.price,
        paymentMethod: bookingForm.paymentMethod,
        paymentStatus: 'pending'
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Randevu oluşturulurken bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return await apiRequest('/api/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
    },
    onSuccess: () => {
      setStep(4); // Success step
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Başarılı!",
        description: "Randevunuz başarıyla oluşturuldu. SMS ile bilgilendirme alacaksınız.",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Ödeme Hatası",
        description: "Ödeme kaydı oluşturulurken bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: Customer) => {
      return await apiRequest('/api/customers', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    },
    onSuccess: (customer) => {
      // Create appointment with customer ID
      const appointmentDateTime = new Date(`${selectedDate}T${bookingForm.timeSlot}`);
      
      createAppointmentMutation.mutate({
        customerId: customer.id,
        packageId: selectedPackage?.id,
        appointmentDate: appointmentDateTime.toISOString(),
        status: 'pending',
        notes: bookingForm.notes
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Müşteri kaydı oluşturulurken bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  const handlePackageSelect = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setBookingForm(prev => ({ ...prev, packageId: pkg.id }));
    setStep(2);
  };

  const handleDateTimeSelect = () => {
    if (!selectedDate || !bookingForm.timeSlot) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tarih ve saat seçin",
        variant: "destructive"
      });
      return;
    }
    setBookingForm(prev => ({ ...prev, appointmentDate: selectedDate }));
    setStep(3);
  };

  const handleFormSubmit = () => {
    // Validate form
    const { customer } = bookingForm;
    if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm gerekli alanları doldurun",
        variant: "destructive"
      });
      return;
    }

    // Create customer first
    createCustomerMutation.mutate(customer);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Randevunuz Alındı!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Randevunuz başarıyla oluşturuldu. Kısa süre içinde SMS ile bilgilendirme alacaksınız.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Paket:</strong> {selectedPackage?.name}</p>
              <p><strong>Tarih:</strong> {new Date(selectedDate).toLocaleDateString('tr-TR')}</p>
              <p><strong>Saat:</strong> {bookingForm.timeSlot}</p>
              <p><strong>Tutar:</strong> ₺{selectedPackage?.price}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button className="flex-1">Ana Sayfa</Button>
              </Link>
              <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
                Yeni Randevu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
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
              <Calendar className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">Randevu Al</h1>
            </div>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNumber}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepNumber ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {stepNumber === 1 && 'Paket Seçimi'}
                  {stepNumber === 2 && 'Tarih & Saat'}
                  {stepNumber === 3 && 'Bilgiler & Ödeme'}
                </span>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ml-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Step 1: Package Selection */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Hizmet Paketini Seçin</h2>
              <p className="text-lg text-gray-600">İhtiyaçlarınıza en uygun paketi seçin</p>
            </div>

            {packagesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Paketler yükleniyor...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {packages?.map((pkg: ServicePackage) => (
                  <Card 
                    key={pkg.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{pkg.name}</CardTitle>
                          <p className="text-gray-600 text-sm mt-1">{pkg.description}</p>
                        </div>
                        <Badge variant="secondary">{pkg.duration} dk</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 mb-4">₺{pkg.price}</div>
                      <Button className="w-full">Bu Paketi Seç</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && selectedPackage && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Tarih ve Saat Seçin</h2>
              <p className="text-lg text-gray-600">
                <strong>{selectedPackage.name}</strong> için uygun tarih ve saati seçin
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Randevu Tarihi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="date">Tarih Seçin</Label>
                  <Input
                    id="date"
                    type="date"
                    min={getTomorrowDate()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <Label>Uygun Saatler</Label>
                    {slotsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Uygun saatler yükleniyor...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {timeSlots?.length > 0 ? timeSlots.map((slot: string) => (
                          <Button
                            key={slot}
                            variant={bookingForm.timeSlot === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBookingForm(prev => ({ ...prev, timeSlot: slot }))}
                          >
                            {slot}
                          </Button>
                        )) : (
                          <p className="col-span-4 text-center text-gray-500 py-4">
                            Bu tarih için uygun saat bulunmuyor
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Geri
                  </Button>
                  <Button onClick={handleDateTimeSelect} className="flex-1">
                    Devam Et
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Customer Info & Payment */}
        {step === 3 && selectedPackage && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Bilgiler ve Ödeme</h2>
              <p className="text-lg text-gray-600">Son adım: bilgilerinizi girin ve ödeme yöntemini seçin</p>
            </div>

            <div className="space-y-6">
              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Randevu Özeti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Paket</p>
                      <p className="font-medium">{selectedPackage.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Süre</p>
                      <p className="font-medium">{selectedPackage.duration} dakika</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tarih</p>
                      <p className="font-medium">{new Date(selectedDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Saat</p>
                      <p className="font-medium">{bookingForm.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tutar</p>
                      <p className="font-medium text-blue-600 text-lg">₺{selectedPackage.price}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Kişisel Bilgiler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Ad</Label>
                      <Input
                        id="firstName"
                        value={bookingForm.customer.firstName}
                        onChange={(e) => setBookingForm(prev => ({
                          ...prev,
                          customer: { ...prev.customer, firstName: e.target.value }
                        }))}
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Soyad</Label>
                      <Input
                        id="lastName"
                        value={bookingForm.customer.lastName}
                        onChange={(e) => setBookingForm(prev => ({
                          ...prev,
                          customer: { ...prev.customer, lastName: e.target.value }
                        }))}
                        placeholder="Soyadınız"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingForm.customer.email}
                      onChange={(e) => setBookingForm(prev => ({
                        ...prev,
                        customer: { ...prev.customer, email: e.target.value }
                      }))}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={bookingForm.customer.phone}
                      onChange={(e) => setBookingForm(prev => ({
                        ...prev,
                        customer: { ...prev.customer, phone: e.target.value }
                      }))}
                      placeholder="0555 123 45 67"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                    <Textarea
                      id="notes"
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Özel bir talebiniz varsa buraya yazabilirsiniz"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Ödeme Yöntemi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={bookingForm.paymentMethod}
                    onValueChange={(value: 'bank_transfer' | 'eft' | 'paytr') => 
                      setBookingForm(prev => ({ ...prev, paymentMethod: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme yöntemi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                      <SelectItem value="eft">EFT</SelectItem>
                      <SelectItem value="paytr">PayTR (Kredi Kartı)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-2">
                    Randevu onaylandıktan sonra ödeme bilgileri SMS ile gönderilecektir.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Geri
                </Button>
                <Button 
                  onClick={handleFormSubmit} 
                  className="flex-1"
                  disabled={createCustomerMutation.isPending || createAppointmentMutation.isPending}
                >
                  {createCustomerMutation.isPending || createAppointmentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      İşlem Yapılıyor...
                    </>
                  ) : (
                    'Randevuyu Onayla'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}