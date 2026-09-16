export type Screen =
  | "splash"
  | "language"
  | "auth"
  | "login"
  | "register-1"
  | "register-otp"
  | "register-2"
  | "register-3"
  | "register-4"
  | "register-5"
  | "home"
  | "marketplace"
  | "cooperative"
  | "dashboard"
  | "profile"
  | "ai-assistant"
  | "ai-camera"
  | "crop-advisory"
  | "weather"
  | "schemes"
  | "trends"
  | "market-prices"
  | "notifications"
  | "transactions";

export interface Address {
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  address: Address;
  profession: string;
  farmerType: string;
  productsHave: string[];
  productsNeed: string[];
  idType: string;
  idVerified: boolean;
  trustScore: number;
}

export interface AppState {
  language: string;
  screen: Screen;
  user: UserProfile | null;
  isLoggedIn: boolean;
  prevScreen: Screen | null;
}

export interface FarmerListing {
  id: string;
  name: string;
  location: string;
  distance: number;
  phone: string;
  products: string[];
  quantity: string;
  price: string;
  trustScore: number;
  matchPercent: number;
  verified: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  seller: string;
  location: string;
  distance: number;
  trustScore: number;
  canSell: boolean;
  mayNeed: boolean;
  image?: string;
}

export interface Notification {
  id: string;
  type: "demand" | "supply" | "scheme" | "weather" | "cooperative" | "transaction";
  text: string;
  time: string;
}

export interface GovScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefit: string;
  deadline: string;
  state: string;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  rainChance: number;
  condition: string;
  forecast: { day: string; high: number; low: number; icon: string }[];
}

export interface MarketPrice {
  product: string;
  price: string;
  change: string;
  trend: "up" | "down" | "stable";
  demand: "high" | "medium" | "low";
  bestSellPeriod: string;
}
