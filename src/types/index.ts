export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Vehicle {
  id: string;
  user_id?: string;
  vehicle_id: string;
  registration_time: Date;
  status: 'active' | 'offline' | 'error';
  lat: number;
  lng: number;
  last_location_update?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVehicleData {
  id?: string;
  vehicle_id: string;
  registration_time: Date;
  status?: 'active' | 'offline' | 'error';
  lat?: number;
  lng?: number;
}

export interface UpdateVehicleData {
  vehicle_id?: string;
  registration_time?: Date;
  status?: 'active' | 'offline' | 'error';
  lat?: number;
  lng?: number;
}

export interface VehicleLocation {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  satellite: number;
  speed_kmh: number;
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
