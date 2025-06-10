import CouponDashboard from "@/components/coupon-dashboard";

export default function CouponDashboardPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Coupon Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          View and manage meal coupon statistics
        </p>
      </div>

      <CouponDashboard />
    </div>
  );
}
