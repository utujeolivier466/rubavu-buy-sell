export interface Agent {
  id: string;
  name: string;
  position: string;
  phone?: string | null;
  photo_url?: string | null;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  description?: string | null;

  property_type: 'Apartment' | 'Commercial' | 'House' | 'Land';
  listing_type: 'Sale' | 'Rent';
  status: 'Available' | 'Sold' | 'Rented' | 'Pending';

  price: number;
  currency: string;
  size_sqm?: number | null;

  bedrooms?: number | null;
  bathrooms?: number | null;
  zoning?: string | null;

  location_text: string;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  has_pool: boolean;
  has_parking: boolean;
  has_garden: boolean;
  has_electricity: boolean;
  has_water: boolean;
  has_internet: boolean;

  cover_image_url?: string | null;
  image_urls?: string[] | null;
  video_url?: string | null;
  youtube_url?: string | null;

  is_featured: boolean;
  is_hot_deal: boolean;

  agent_id?: string | null;
  agents?: Agent | null;

  created_at: string;
  updated_at: string;
}

export type SubmissionStatus = 'pending' | 'reviewed' | 'converted' | 'rejected';

export interface PropertySubmission {
  id: string;
  full_name: string;
  phone: string;
  location_text: string;
  price: number;
  currency: string;
  property_type: 'Apartment' | 'Commercial' | 'House' | 'Land';
  upi?: string | null;
  photo_urls?: string[] | null;
  status: SubmissionStatus;
  converted_property_id?: string | null;
  created_at: string;
}

export type InquirySource = 'whatsapp' | 'site_visit' | 'contact_form';
export type InquiryStatus = 'new' | 'contacted' | 'closed';

export interface Inquiry {
  id: string;
  property_id: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  source: InquirySource;
  status: InquiryStatus;
  created_at: string;
}