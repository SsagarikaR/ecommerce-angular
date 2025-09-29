export interface category {
  categoryID: number;
  categoryName: string;
  categoryThumbnail: string;
}

export interface brand {
  brandID: number;
  brandName: string;
  brandThumbnail: string;
}

export interface product {
  productID: number;
  productName: string;
  productThumbnail: string;
  productDescription: string;
  productPrice: number;
  categoryID: number;
  stock: number;
  brandID: number;
  brandName: string;
  totalCount: number;
  rating: number;
  categoryName: string;
  wishListID?: number;
  wishlist: string;

  productImage1: string;

  productImage2: string;

  productImage3?: string;

  productImage4?: string;
}

export interface CategroyData {
  categoryID: number;
  categoryName: string;
  categoryThumbnail: string;
}

export interface cartItem extends product, brand, category {
  cartItemID: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  orderID: number;
  totalAmount: number;
  items: OrderItem[];
  state: string;
  city: string;
  pincode: string;
  locality: string;
  address: AddressData;
  totalPrice: number;
  status?: 'Pending' | 'Success' | 'Cancelled';
  createdAt?: string;
  updatedAt?: string;
  userID?: number;
  addressID?: number;
  handlingPrice: number;
  platformFee: number;
  deliveryCharge: number;
}

export interface OrderItem {
  quantity: number;
  price: number;
  orderItemID: number;
  orderId: number;
  productId: number;
  productName: string;
  productThumbnail: string;
  productPrice: number;
  brandName: string;
}

export interface AddressData {
  addressID?: number;
  state: string;
  city: string;
  pincode: string;
  locality: string;
  address: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
  originalFilename: string;
  format: string;
  bytes: number;
}

export interface review {
  reviewID: number;
  productID: number;
  userID: number;
  rating: number;
  description: string;
  name: string;
  contactNo: string;
  password?: string;
  email: string;
}
