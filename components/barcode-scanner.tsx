"use client";

import type React from "react";
import type { Coupon } from "../types/coupon";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Scan } from "lucide-react";

import CouponClaimModal from "./coupon-claim-modal";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BarcodeScanner: React.FC = () => {
  const [barcode, setBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [couponData, setCouponData] = useState<Coupon | null>(null);
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (!barcode.trim()) {
      toast.error("Please enter a barcode");
      return;
    }

    setIsScanning(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/coupons/scan/${barcode}`,
      );
      const coupon = response.data;

      // Validate coupon according to business rules
      const today = new Date().toISOString().split("T")[0];
      const couponDate = coupon.coupon_date;

      if (coupon.is_claimed) {
        toast.error("This coupon has already been claimed");
        return;
      }

      if (couponDate < today) {
        toast.error("This coupon has expired and cannot be claimed");
        return;
      }

      // Valid coupon - show confirmation modal
      setCouponData(coupon);
      setShowModal(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Coupon not found. Please check the barcode.");
      } else {
        toast.error("Failed to scan coupon. Please try again.");
      }
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClaimSuccess = () => {
    setBarcode("");
    setCouponData(null);
    setShowModal(false);
    toast.success("Coupon claimed successfully!");

    // Focus back to input for next scan
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  // Automatically scan when barcode changes
  useEffect(() => {
    if (barcode.trim()) {
      handleScan();
    }
  }, [barcode]);

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan Meal Coupon
          </CardTitle>
          <CardDescription>
            Scan or enter the barcode to validate and claim a meal coupon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              ref={inputRef}
              autoFocus
              className="font-mono"
              id="barcode"
              placeholder="Enter or scan barcode"
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <strong>Validation Rules:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Future-dated coupons can be claimed in advance</li>
              <li>Past-dated unclaimed coupons are expired</li>
              <li>Already claimed coupons cannot be claimed again</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {couponData && (
        <CouponClaimModal
          coupon={couponData}
          isOpen={showModal}
          onClaimSuccess={handleClaimSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default BarcodeScanner;
