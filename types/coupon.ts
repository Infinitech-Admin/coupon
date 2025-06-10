export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
}

export interface Coupon {
  id: number;
  employee_id: number;
  employee: Employee;
  coupon_date: string;
  barcode: string;
  workday_code: string;
  is_claimed: boolean;
  claimed_at?: string;
  created_at: string;
  updated_at: string;
  barcode_image_url?: string;
}

export interface CouponGenerationRequest {
  employee_id: number;
  month: number;
  year: number;
}
