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
  id: string;
  name: string;
  thumbnail: string;
}

export interface cartItem extends product, brand, category {
  cartItemID: number;
  quantity: number;
  totalPrice: number;
}
