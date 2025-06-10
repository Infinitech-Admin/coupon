const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Test API connection
  async testConnection() {
    return this.request("/test");
  }

  // Employee endpoints
  async getEmployees() {
    return this.request("/employees");
  }

  async getEmployee(id: number) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(data: any) {
    return this.request("/employees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: number, data: any) {
    return this.request(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: number) {
    return this.request(`/employees/${id}`, {
      method: "DELETE",
    });
  }

  // Coupon endpoints
  async generateCoupons(employeeId: number) {
    return this.request("/coupons/generate", {
      method: "POST",
      body: JSON.stringify({ employee_id: employeeId }),
    });
  }

  async generateCouponsForAll() {
    return this.request("/coupons/generate-all", {
      method: "POST",
    });
  }

  async scanCoupon(barcode: string) {
    return this.request(`/coupons/scan/${barcode}`);
  }

  async claimCoupon(couponId: number) {
    return this.request(`/coupons/${couponId}/claim`, {
      method: "POST",
    });
  }

  async getCoupons(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/coupons${params ? `?${params}` : ""}`);
  }

  async getStatistics() {
    return this.request("/coupons/statistics");
  }
}

export const api = new ApiClient(API_BASE_URL);
