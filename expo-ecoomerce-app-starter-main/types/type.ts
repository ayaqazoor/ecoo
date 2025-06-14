export interface ProductType {
  productType: string | number | (string | number)[] | null | undefined;
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  categoryId?: string; // جعلها اختيارية بإضافة ?
  discount: number;
  originalPrice: number;
  stock?: number; // Add stock property as optional
}

interface Category {
  id: number;
  name: string;
  image: string;
}

export interface CategoryType {
  id: string;
  name: string;
  image: string;
}

export interface CartItemType {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  productType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationType {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}