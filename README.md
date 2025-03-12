# E-Commerce Application


## Live Link
[Link](https://ecommerce-navy-seven-30.vercel.app/)


## Overview
This is a full-fledged e-commerce application designed to facilitate online shopping. Users can browse products, manage their shopping carts, and complete purchases seamlessly.

## Features
- **User Authentication**: Secure registration and login for users.
- **Product Management**: Browse products dynamically.
- **Shopping Cart**: Add or remove items from the cart with local storage support to track cart data across sessions.
- **Admin Dashboard**: Manage products through the admin panel.
  
## Technical Requirements

### Frontend
- **Framework**: Built using [Next.js](https://nextjs.org/) for server-side rendering and improved performance.
- **Dynamic Product List**: Display a list of available products retrieved from the backend.
- **Basic Validation**: Implemented validation to prevent adding empty products to the cart.
- **AJAX/Fetch API**: Uses Fetch API to interact with the backend without reloading the page.
- **Responsive UI/UX**: The application is user-friendly and responsive across devices.

### Backend
- **Framework**: Developed using [Flask](https://flask.palletsprojects.com/) to create RESTful APIs.
- **API Endpoints**:
  - **Add a Product**: Endpoint to add new products to the database.
  - **Delete a Product**: Endpoint to remove products from the database.
  - **Retrieve Product List**: Endpoint to fetch the list of available products.
  - **Add/Remove Products from Cart**: Endpoints to manage cart items.
- **Database**: Using [MongoDB(atlas)](https://www.mongodb.com/) for data storage.

## Miscellaneous
- **Local Storage**: Implemented local storage or user authentication to track cart data across sessions.
- **Admin Panel**: A basic admin panel was used to manage products efficiently.
- **Deployment**: The application was deployed on cloud platform Vercel (For frontend), Render (For backend).

## Installation

To run this application locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thanusree-123/ecommerce.git
   ```
   
2. **Navigate to the project directory**:
   ```bash
   cd e-commerce
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend  # Navigate to the backend directory
   pip install -r requirements.txt 
   ```

4. **Run the backend server**:
   ```bash
   python app.py  # or the appropriate command for your setup
   ```
5. **Install frontend dependencies**:
   ```bash
   cd ..
   npx create-next-app@latest frontend1
   cd frontend1  # Navigate to the frontend directory
   npm install axios next-auth 
   ```
6. **Copy frontend files to frontend1**
   Drag and drop the files in the frontend folder to the new frontend1 folder (Replace files if existing)
   
7. **Run the frontend application**:
   ```bash
   npm run dev #in frontend1 folder  
   ```

7. **Open your browser** and go to `http://localhost:3000`.

## Usage

- Register a new account or log in to an existing one.
- Browse through the product catalog.
- Add items to your shopping cart with validation.



## Contact

For any inquiries, please reach out to [Pyatlo Thanusree](mailto:thanupyatlo@gmail.com).

