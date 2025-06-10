import CouponGenerator from "../../../../components/coupon-generator";

export default function GeneratePage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          Generate Meal Coupons
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate monthly meal coupons for employees
        </p>
      </div>

      <div className="flex justify-center">
        <CouponGenerator />
      </div>
    </div>
  );
}
