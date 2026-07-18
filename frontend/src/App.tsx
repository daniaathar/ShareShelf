import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { BrowsePage } from "@/pages/BrowsePage";
import { ItemDetailPage } from "@/pages/ItemDetailPage";
import { DashboardHomePage } from "@/pages/dashboard/DashboardHomePage";
import { MyListingsPage } from "@/pages/dashboard/MyListingsPage";
import { CreateListingPage } from "@/pages/dashboard/CreateListingPage";
import { EditListingPage } from "@/pages/dashboard/EditListingPage";
import { BookingsPage } from "@/pages/dashboard/BookingsPage";
import { BookingDetailPage } from "@/pages/dashboard/BookingDetailPage";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";
import { NotificationsPage } from "@/pages/dashboard/NotificationsPage";

// Client-only wrapper: BrowserRouter uses window.history and cannot render on the server.
export function AppRouter() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/items/:itemId" element={<ItemDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHomePage />} />
              <Route path="/dashboard/listings" element={<MyListingsPage />} />
              <Route path="/dashboard/listings/new" element={<CreateListingPage />} />
              <Route path="/dashboard/listings/:itemId/edit" element={<EditListingPage />} />
              <Route path="/dashboard/bookings/:role" element={<BookingsPage />} />
              <Route path="/dashboard/bookings/detail/:bookingId" element={<BookingDetailPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default AppRouter;