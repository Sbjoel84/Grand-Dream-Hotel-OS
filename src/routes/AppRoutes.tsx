import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { FrontDeskPage } from '../pages/frontdesk/FrontDeskPage';
import { CheckInWorkflowPage } from '../pages/frontdesk/CheckInWorkflowPage';
import { CheckOutWorkflowPage } from '../pages/frontdesk/CheckOutWorkflowPage';
import { ReservationsPage } from '../pages/reservations/ReservationsPage';
import { GuestsPage } from '../pages/guests/GuestsPage';
import { RoomsPage } from '../pages/rooms/RoomsPage';
import { RoomTypesPage } from '../pages/rooms/RoomTypesPage';
import { HousekeepingPage } from '../pages/housekeeping/HousekeepingPage';
import { POSPage } from '../pages/restaurant/POSPage';
import { OrdersPage } from '../pages/restaurant/OrdersPage';
import { MenuPage } from '../pages/restaurant/MenuPage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { StockTransactionsPage } from '../pages/inventory/StockTransactionsPage';
import { PurchaseOrdersPage } from '../pages/procurement/PurchaseOrdersPage';
import { SuppliersPage } from '../pages/procurement/SuppliersPage';
import { FinancialSummaryPage } from '../pages/finance/FinancialSummaryPage';
import { PaymentsPage } from '../pages/finance/PaymentsPage';
import { ExpensesPage } from '../pages/finance/ExpensesPage';
import { MaintenancePage } from '../pages/maintenance/MaintenancePage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { UsersPage } from '../pages/users/UsersPage';
import { AuditLogsPage } from '../pages/audit/AuditLogsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute permission="dashboard.view">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="frontdesk"
            element={
              <ProtectedRoute permission="frontdesk.checkin">
                <FrontDeskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="check-in"
            element={
              <ProtectedRoute permission="frontdesk.checkin">
                <CheckInWorkflowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="check-out"
            element={
              <ProtectedRoute permission="frontdesk.checkout">
                <CheckOutWorkflowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reservations"
            element={
              <ProtectedRoute permission="reservations.view">
                <ReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="guests"
            element={
              <ProtectedRoute permission="guests.view">
                <GuestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="rooms"
            element={
              <ProtectedRoute permission="rooms.view">
                <RoomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="room-types"
            element={
              <ProtectedRoute permission="rooms.view">
                <RoomTypesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="housekeeping"
            element={
              <ProtectedRoute permission="housekeeping.view">
                <HousekeepingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="restaurant/pos"
            element={
              <ProtectedRoute permission="pos.access">
                <POSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="restaurant/orders"
            element={
              <ProtectedRoute permission="pos.access">
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="restaurant/menu"
            element={
              <ProtectedRoute permission="pos.access">
                <MenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute permission="inventory.view">
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory/transactions"
            element={
              <ProtectedRoute permission="inventory.view">
                <StockTransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="procurement/orders"
            element={
              <ProtectedRoute permission="procurement.manage">
                <PurchaseOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="procurement/suppliers"
            element={
              <ProtectedRoute permission="procurement.manage">
                <SuppliersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance"
            element={<Navigate to="/finance/summary" replace />}
          />
          <Route
            path="finance/summary"
            element={
              <ProtectedRoute permission="finance.view">
                <FinancialSummaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/payments"
            element={
              <ProtectedRoute permission="finance.view">
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/expenses"
            element={
              <ProtectedRoute permission="finance.view">
                <ExpensesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="maintenance"
            element={
              <ProtectedRoute permission="maintenance.view">
                <MaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute permission="reports.view">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute permission="users.manage">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="audit"
            element={
              <ProtectedRoute permission="audit.view">
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute permission="settings.manage">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
