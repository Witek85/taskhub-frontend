export interface LoginRequest {
  username: string;
  password: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  token: string;
  user: CurrentUser;
}
