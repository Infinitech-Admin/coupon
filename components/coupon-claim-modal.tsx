"use client";

import type React from "react";
import type { Coupon } from "../types/coupon";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Calendar, User, Hash, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CouponClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon;
  onClaimSuccess: () => void;
}

const CouponClaimModal: React.FC<CouponClaimModalProps> = ({
  isOpen,
  onClose,
  coupon,
  onClaimSuccess,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/coupons/${coupon.id}/claim`,
      );
      onClaimSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to claim coupon";

      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsClaiming(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isAdvanceClaim = () => {
    const today = new Date().toISOString().split("T")[0];

    return coupon.coupon_date > today;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Confirm Coupon Claim
          </DialogTitle>
          <DialogDescription>
            Please verify the coupon details before claiming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">
                {coupon.employee.first_name} {coupon.employee.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                ID: {coupon.employee.employee_id} • {coupon.employee.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">{formatDate(coupon.coupon_date)}</p>
              {isAdvanceClaim() && (
                <Badge className="mt-1" variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Advance Claim
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Workday Code</p>
              <p className="text-sm font-mono text-muted-foreground">
                {coupon.workday_code}
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-yellow-50 border border-yellow-200 p-2 rounded">
            <strong>Barcode:</strong> {coupon.barcode}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button disabled={isClaiming} variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isClaiming} onClick={handleClaim}>
            {isClaiming ? "Claiming..." : "Confirm Claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CouponClaimModal;
