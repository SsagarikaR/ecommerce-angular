# ShopMate - Angular E-commerce Platform

A full-featured e-commerce application built with Angular, featuring product management, shopping cart, order processing, and admin dashboard functionality.

##  Features

### Customer Features

- **Product Catalog**: Browse and view detailed product information
- **Search & Filter**: Search products by name and filter by categories
- **Shopping Cart**: Add products to cart
- **Wishlist**: Save favorite products for later
- **Product Reviews**: Read and write product reviews
- **Checkout Process**: Simple and secure checkout flow
- **Order Management**: View order history and track orders
- **User Authentication**: Sign up, login

### Admin Features

- **Admin Dashboard**: Comprehensive admin panel
- **Product Management**: Create, edit, and delete products
- **Category Management**: Manage product categories
- **Brand Management**: Add and manage product brands

##  Technologies Used

- **Frontend**: Angular 20
- **Styling**: Tailwind CSS
- **Components**: Custom Angular components
- **Routing**: Angular Router
- **HTTP Client**: Angular HttpClient

##  Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

##  Installation

1. Clone the repository:

```bash
git clone https://github.com/SsagarikaR/ecommerce-angular.git
cd angular-ecommerce
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200/`

##  Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── header/
│   │   ├── footer/
│   │   ├── product-card/
│   │   └── ...
│   ├── pages/
│   │   ├── home/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── wishlist/
│   │   └── admin/
│   ├── services/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── auth/
│   │   └── ...
│   └── guards/
│   |    ├── auth.guard.ts
│   |    └── admin.guard.ts
│   └── interceptor/
│       ├── token.interceptor.ts
│       └── error.interceptor.ts
```

##  Available Scripts

### Development

```bash
# Start development server
ng serve

# Start with specific port
ng serve --port 4201

# Start and open browser automatically
ng serve --open
```


### Code Generation

```bash
# Generate new component
ng generate c components/component-name

# Generate new service
ng generate service services/service-name


```

### Testing

```bash
# Run unit tests
ng test

# Run tests with coverage
ng test --code-coverage


```

### Code Quality

```bash
# Lint the code
ng lint

# Format code 
npm run format
```

##  Authentication & Authorization

The application includes:

- User registration and login
- JWT token-based authentication
- Role-based access control (Customer/Admin)
- Route guards for protected pages

##  Key Functionalities

### Product Management

- Product listing with pagination
- Product search and filtering
- Product details with image gallery
- Related products suggestions

### Shopping Experience

- Add to cart functionality
- Cart quantity management
- Wishlist management
- Product reviews and ratings

### Order Processing

- Checkout flow with shipping details
- Order confirmation
- Order history and tracking
- Email notifications

### Admin Panel

- Dashboard with analytics
- CRUD operations for products
- Category and brand management
- Order management system




