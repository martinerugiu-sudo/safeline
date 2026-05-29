export type EquipmentStatus = "ok" | "inspect_soon" | "to_replace" | "retired";
export type MemberRole = "owner" | "admin" | "member";
export type SubscriptionTier = "free" | "pro" | "team";
export type AlertType = "expiration" | "inspection" | "training";
export type InspectionResult = "passed" | "failed" | "conditional";

export interface Organization {
  id: string;
  name: string;
  siret: string | null;
  owner_id: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  invited_email: string | null;
  joined_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  current_organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  category: string;
  max_lifetime_years: number | null;
  max_use_lifetime_years: number | null;
  inspection_interval_months: number;
  norm_reference: string;
  retire_after_fall: boolean;
  description: string | null;
}

export interface Equipment {
  id: string;
  user_id: string;
  organization_id: string | null;
  equipment_type_id: string;
  brand: string;
  model: string;
  serial_number: string | null;
  manufacture_date: string | null;
  purchase_date: string | null;
  first_use_date: string | null;
  purchase_price: number | null;
  status: EquipmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  equipment_types?: EquipmentType;
  expiration_date?: string | null;
  next_inspection_date?: string | null;
}

export interface Invoice {
  id: string;
  user_id: string;
  equipment_id: string | null;
  organization_id: string | null;
  file_url: string;
  filename: string;
  amount: number | null;
  invoice_date: string | null;
  supplier: string | null;
  created_at: string;
  equipment?: Equipment;
}

export interface Inspection {
  id: string;
  equipment_id: string;
  user_id: string;
  organization_id: string | null;
  inspection_date: string;
  result: InspectionResult;
  inspector_name: string | null;
  next_inspection_date: string | null;
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
  equipment?: Equipment;
}

export interface Alert {
  id: string;
  user_id: string;
  organization_id: string | null;
  equipment_id: string;
  alert_type: AlertType;
  due_date: string;
  sent_at: string | null;
  dismissed_at: string | null;
  created_at: string;
  equipment?: Equipment;
}

export interface Regulation {
  id: string;
  title: string;
  description: string;
  applicable_norm: string | null;
  equipment_category: string | null;
  last_updated: string;
  source_url: string | null;
}
