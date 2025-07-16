import { Link } from "wouter";
import { Calendar, Clock, CreditCard, MessageCircle, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">RandevuPro</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#hizmetler" className="text-gray-600 hover:text-blue-600 transition-colors">Hizmetler</a>
              <a href="#nasil-calisir" className="text-gray-600 hover:text-blue-600 transition-colors">Nasıl Çalışır</a>
              <a href="#iletisim" className="text-gray-600 hover:text-blue-600 transition-colors">İletişim</a>
            </nav>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Kolayca Randevu Alın
              <span className="text-blue-600 block">Zamanınızı Planlayın</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Profesyonel hizmetlerimiz için online randevu alın. Güvenli ödeme, SMS onayı ve esnek zaman seçenekleri ile size en uygun çözümü sunuyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/randevu">
                <Button size="lg" className="text-lg px-8 py-4">
                  <Calendar className="mr-2 h-5 w-5" />
                  Hemen Randevu Al
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <MessageCircle className="mr-2 h-5 w-5" />
                Canlı Destek
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Kolay Randevu</h3>
              <p className="text-gray-600 text-sm">Birkaç tıkla istediğiniz tarih ve saatte randevu alın</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Güvenli Ödeme</h3>
              <p className="text-gray-600 text-sm">Banka havalesi, EFT ve PayTR ile güvenli ödeme</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">SMS Onayı</h3>
              <p className="text-gray-600 text-sm">Randevunuz için otomatik SMS bildirimi alın</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Esnek Saatler</h3>
              <p className="text-gray-600 text-sm">Size en uygun zaman dilimini seçin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="hizmetler" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Hizmet Paketlerimiz</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              İhtiyaçlarınıza göre özel olarak hazırlanmış hizmet paketlerimizi keşfedin
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Popüler</Badge>
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </div>
                <CardTitle className="text-xl">Temel Paket</CardTitle>
                <CardDescription>Standart danışmanlık hizmeti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-4">₺299</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />60 dakika görüşme</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Kişisel analiz</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />SMS hatırlatma</li>
                </ul>
                <Link href="/randevu">
                  <Button className="w-full mt-6">Randevu Al</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-600">Önerilen</Badge>
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </div>
                <CardTitle className="text-xl">Premium Paket</CardTitle>
                <CardDescription>Kapsamlı danışmanlık ve takip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-4">₺499</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />90 dakika görüşme</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Detaylı rapor</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />7 gün takip</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />WhatsApp desteği</li>
                </ul>
                <Link href="/randevu">
                  <Button className="w-full mt-6">Randevu Al</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">VIP</Badge>
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </div>
                <CardTitle className="text-xl">Exclusive Paket</CardTitle>
                <CardDescription>Özel ve kişiselleştirilmiş hizmet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-4">₺799</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />120 dakika görüşme</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Özel plan hazırlama</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />30 gün takip</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Öncelikli destek</li>
                </ul>
                <Link href="/randevu">
                  <Button className="w-full mt-6">Randevu Al</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nasıl Çalışır?</h2>
            <p className="text-lg text-gray-600">Sadece 3 adımda randevunuzu alın</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Paket Seçin</h3>
              <p className="text-gray-600">İhtiyaçlarınıza en uygun hizmet paketini seçin</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Tarih Belirleyin</h3>
              <p className="text-gray-600">Uygun tarih ve saat dilimini seçin</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Ödeme Yapın</h3>
              <p className="text-gray-600">Güvenli ödeme yöntemleri ile işlemi tamamlayın</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="iletisim" className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-bold">RandevuPro</h3>
              </div>
              <p className="text-gray-400">Profesyonel randevu yönetim sistemi ile zamanınızı verimli kullanın.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hizmetler</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Temel Paket</li>
                <li>Premium Paket</li>
                <li>Exclusive Paket</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Canlı Chat</li>
                <li>E-posta Desteği</li>
                <li>Telefon Desteği</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 info@randevupro.com</p>
                <p>📞 0850 123 45 67</p>
                <p>📍 İstanbul, Türkiye</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RandevuPro. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}