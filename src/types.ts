export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface Card {
  id: number;
  user_id: number;
  numbers: number[];
  purchased: number; // 0 for pending, 1 for approved
  week_number: number;
  username?: string; // For admin view
}

export interface Draw {
  id: number;
  week_number: number;
  numbers: number[];
}

export interface Settings {
  card_price: string;
  total_weeks: string;
  current_week: string;
  pix_key: string;
  whatsapp_number: string;
}
