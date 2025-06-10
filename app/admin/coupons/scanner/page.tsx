import BarcodeScanner from "@/components/barcode-scanner";

export default function ScannerPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Scan Meal Coupons</h1>
        <p className="text-muted-foreground mt-2">
          Scan and validate employee meal coupons
        </p>
      </div>

      <div className="flex justify-center">
        <BarcodeScanner />
      </div>
    </div>
  );
}
