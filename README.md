# Product Management Frontend

Frontend application for an e-commerce product management system, built with **ReactJS**.  
The project supports both **Customer (Client)** and **Administrator (Admin)** roles and is designed to work with a RESTful backend API.

---

## Project Overview

This frontend project provides a complete user interface for an e-commerce system, including product browsing, ordering, payment flow, and admin management features.

The application is structured with reusable components, clear separation of concerns, and scalable state management using React Context API.

---

## Tech Stack

- **Framework:** ReactJS
- **Routing:** react-router-dom
- **State Management:** React Context API
- **Styling:** Pure CSS (component-based structure)
- **HTTP Client:** Axios
- **Charts & Statistics:** chart.js, react-chartjs-2
- **Icons:** react-icons

---

## Implemented Features

### 1. Client (Customer) Features

- **Authentication**
  - User login and registration

- **Client Profile**
  - View and update personal information
  - Address management
  - Order history tracking

- **Shop & Product Browsing**
  - Product listing in grid layout
  - Product filtering by category, price, and conditions
  - Product card UI with badges: *Out of stock*, *Sale*, *New*

- **Product Details**
  - View detailed product information
  - Image gallery and descriptions
  - View and submit reviews and ratings

- **Cart & Wishlist**
  - Add, remove, and update cart items
  - Wishlist management

- **Checkout & Payment**
  - Checkout process UI
  - Payment result handling

- **Utilities**
  - Toast notifications
  - Notification page
  - Integrated support chatbot

---

### 2. Admin Features

- **Admin Dashboard**
  - Overview statistics and charts

- **Product Management**
  - Create, update, delete products

- **Category Management**
  - Manage product categories

- **User Management**
  - View and manage user accounts

- **Order Management**
  - View and update order statuses

- **Review Management**
  - Approve, update, and delete product reviews

---

## Architecture & Technical Highlights

- **Protected Routes**
  - Route protection for authenticated users and admin roles

- **Global State Management**
  - AuthContext for authentication state
  - CartContext for cart operations

- **Reusable Components**
  - ProductCard
  - StarRating
  - Toast
  - Skeleton loading UI

- **Service Layer**
  - Centralized API handling via `services/`
  - Separated logic for authentication, reviews, products, etc.

---

## Future Improvements

- Complete backend integration testing
- Add product search by keyword
- Pagination for large data lists
- Improve user profile (change password, avatar)
- Add unit and integration tests with Jest & React Testing Library
- Performance optimization with lazy loading and code splitting

---

## Installation & Run Guide

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
2. Navigate to project directory:
   ```bash
   cd product-management-frontend
3. Install dependencies:
    ```bash
    npm install
4. Run the application:
    ```bash
    npm start
5. Open browser at:
    ```bash
    http://localhost:3000
