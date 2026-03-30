import request from "./request";

export interface RechargePackage {
  id: string;
  name: string;
  amount: number;
  points: number;
}

export interface PaymentOrder {
  id: number;
  order_no: string;
  user_id: number;
  order_type: string;
  package_id: string;
  package_name: string;
  amount: number;
  points: number;
  status: "pending" | "paid" | string;
  payment_channel: string;
  third_party_order_no: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: number;
  order_id: number;
  user_id: number;
  channel: string;
  transaction_type: string;
  trade_no: string | null;
  status: string;
  request_data: unknown;
  response_data: unknown;
  callback_data: unknown;
  created_at: string;
  updated_at: string;
}

export interface PointsLog {
  id: number;
  user_id: number;
  change_type: string;
  change_amount: number;
  balance_after: number;
  order_id: number | null;
  remark: string | null;
  created_at: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedList<T> {
  total: number;
  list: T[];
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateRechargeOrderResponse {
  order: PaymentOrder;
  payment: {
    channel: string;
  };
}

export interface RechargeOrderDetail {
  order: PaymentOrder;
  transactions: PaymentTransaction[];
}

export interface MockPayRechargeOrderResponse {
  alreadyPaid: boolean;
  order: PaymentOrder;
  transactions: PaymentTransaction[];
  currentPoints: number;
}

export const getRechargePackages = (): Promise<
  ApiResponse<RechargePackage[]>
> => request.get("/app/recharge/packages");

export const createRechargeOrder = (
  packageId: string,
): Promise<ApiResponse<CreateRechargeOrderResponse>> =>
  request.post("/app/recharge/orders", { packageId });

export const getRechargeOrders = (
  page: number = 1,
  pageSize: number = 10,
): Promise<ApiResponse<PaginatedList<PaymentOrder>>> =>
  request.get("/app/recharge/orders", { params: { page, pageSize } });

export const getRechargeOrderDetail = (
  id: number,
): Promise<ApiResponse<RechargeOrderDetail>> =>
  request.get(`/app/recharge/orders/${id}`);

export const mockPayRechargeOrder = (
  id: number,
): Promise<ApiResponse<MockPayRechargeOrderResponse>> =>
  request.post(`/app/recharge/orders/${id}/mock-pay`);

export const getPointsLogs = (
  page: number = 1,
  pageSize: number = 20,
): Promise<ApiResponse<PaginatedList<PointsLog>>> =>
  request.get("/app/points/logs", { params: { page, pageSize } });
