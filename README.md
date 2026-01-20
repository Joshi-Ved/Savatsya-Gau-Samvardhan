# 🌿 SAVATSYA GAU SAMVARDHAN - E-Commerce Platform

## 📋 Project Overview
This is a full-stack e-commerce platform created for **SAVATSYA GAU SAMVARDHAN**, a small-scale family-run business specializing in natural incense sticks and pure A2 cow ghee. The website represents their digital transformation journey, bringing traditional products to the online marketplace with modern web technologies.

This project showcases comprehensive web development skills gained over 2 years as an engineering student, featuring a complete production-ready application with authentication, payment processing, email notifications, and responsive design.

## How can I edit this code?

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🚀 Deployment

### **Frontend Deployment (Vercel)**
- Automatic deployment from GitHub main branch
- Environment variables configured in Vercel dashboard
- Custom domain support with SSL certificates

### **Backend Deployment (Render)**
- RESTful API hosted on Render cloud platform
- Environment variables securely stored
- Automatic deployments from GitHub

### **Database (MongoDB Atlas)**
- Cloud-hosted MongoDB database
- Automatic backups and scaling
- Connection via secure connection strings

## 📊 Performance Optimizations

- **⚡ Code Splitting** - Dynamic imports for optimal bundle sizes
- **🖼️ Image Optimization** - Cloudinary for responsive image delivery
- **💾 Caching** - Strategic caching for API responses
- **📱 Lazy Loading** - Components loaded on demand
- **🔄 State Management** - Optimized React Context usage

## 🛡️ Security Measures

- **🔐 JWT Authentication** - Stateless token-based authentication
- **🛡️ Input Sanitization** - Server-side validation and sanitization
- **🔒 Environment Variables** - Sensitive data protection
- **📧 Email Verification** - Account security and password reset
- **⏰ Token Expiration** - Time-limited security tokens
- **🌐 CORS Configuration** - Cross-origin request security

## 📱 Browser Support

- ✅ Chrome (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact & Support

- **Business Email**: info@savatsya-gau-samvardhan.com
- **Developer**: Harshal Chugwani and Ved Joshi
- **GitHub**: [Repository Link](https://github.com/Blankstar1233/Savatsya-Gau-Samvardhan)

## 📄 License

This project is proprietary software developed for SAVATSYA GAU SAMVARDHAN. All rights reserved.

## 🚀 Technologies & Frameworks

### **Frontend Stack**
- **⚛️ React 18** - Modern component-based UI library for building interactive user interfaces
- **📘 TypeScript** - Type-safe JavaScript for better development experience and code reliability
- **⚡ Vite** - Lightning-fast build tool and development server with HMR (Hot Module Replacement)
- **🎨 Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **🧩 Shadcn/UI** - Beautiful, accessible, and customizable React component library
- **📱 React Router DOM** - Declarative routing for single-page applications
- **🔔 Sonner** - Toast notification system for user feedback
- **📊 TanStack Query** - Powerful data synchronization for React applications

### **Backend Stack**
- **🟢 Node.js** - JavaScript runtime environment for server-side development
- **🚀 Express.js** - Fast, minimalist web framework for Node.js
- **🍃 MongoDB** - NoSQL document database for flexible data storage
- **🏗️ Mongoose** - Elegant MongoDB object modeling for Node.js
- **🔐 JWT (jsonwebtoken)** - Secure authentication and authorization tokens
- **🔒 Bcrypt.js** - Password hashing library for secure user authentication
- **📧 SendGrid** - Cloud-based email delivery service for transactional emails
- **🌐 CORS** - Cross-Origin Resource Sharing middleware
- **📁 Multer** - Middleware for handling multipart/form-data (file uploads)

### **Cloud & Services**
- **☁️ Cloudinary** - Cloud-based image and video management service
- **📨 SendGrid API** - Professional email delivery and management
- **🗄️ MongoDB Atlas** - Cloud-hosted MongoDB database service
- **🚀 Vercel** - Frontend deployment and hosting platform
- **🖥️ Render** - Backend API deployment platform

### **Development Tools**
- **📦 NPM** - Package manager for JavaScript dependencies
- **🔧 ESLint** - JavaScript linting utility for code quality
- **🎯 PostCSS** - Tool for transforming CSS with JavaScript
- **📝 VS Code** - Primary development environment
- **🐙 Git & GitHub** - Version control and collaborative development

### **Key Features Implemented**
- **🔐 Authentication System** - Complete user registration, login, and JWT-based authentication
- **👤 User Profile Management** - Profile editing, avatar uploads, address management
- **🛡️ Two-Factor Authentication (2FA)** - Enhanced security with email-based 2FA
- **🔑 Password Recovery** - Forgot password functionality with email verification
- **📧 Email Notifications** - Welcome emails, password resets, account notifications
- **🛒 Shopping Cart** - Add to cart, quantity management, persistent cart state
- **💳 Payment Integration** - UPI payment processing for Indian market
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS
- **🌙 Theme System** - Light/dark mode with user preferences
- **🗂️ Newsletter Subscription** - Email marketing integration
- **🔍 Product Catalog** - Dynamic product listing with categories
- **📍 Store Locator** - Google Maps integration for business location

### **Security Features**
- **🛡️ Input Validation** - Server-side validation and sanitization
- **🔐 Password Hashing** - Bcrypt encryption for user passwords
- **🎫 JWT Authentication** - Stateless authentication tokens
- **🔒 Environment Variables** - Secure configuration management
- **📧 Email Verification** - Account verification and password reset tokens
- **⏰ Token Expiration** - Time-limited security tokens

## ⚙️ Environment Setup

### **Backend Configuration**
Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
FROM_EMAIL=your_verified_sender_email@domain.com
FROM_NAME=Savatsya Gau Samvardhan

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Payment Configuration
UPI_ID=your_upi_id@provider
```

### **Frontend Configuration**
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- NPM or Yarn
- MongoDB Account (Atlas recommended)
- SendGrid Account (for email services)
- Cloudinary Account (for image uploads)

### **Installation & Development**

1. **Clone the repository:**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Backend Setup:**
```bash
cd backend
npm install
npm start
```

3. **Frontend Setup:**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
SAVATSYA-GAU-SAMVARDHAN/
├── 📁 backend/
│   ├── 📁 middleware/     # Authentication & validation middleware
│   ├── 📁 models/         # MongoDB schemas (User, Order, etc.)
│   ├── 📁 routes/         # API endpoints (auth, user, orders, etc.)
│   ├── 📁 utils/          # Helper functions (email, cloudinary, etc.)
│   ├── 📄 index.js        # Express server entry point
│   └── 📄 package.json    # Backend dependencies
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/  # Reusable UI components
│   │   ├── 📁 contexts/    # React Context (Auth, Cart, Theme)
│   │   ├── 📁 pages/       # Application pages/routes
│   │   ├── 📁 hooks/       # Custom React hooks
│   │   ├── 📁 lib/         # Utility libraries
│   │   └── 📁 config/      # API endpoints & configuration
│   ├── 📄 index.html       # HTML entry point
│   ├── 📄 package.json     # Frontend dependencies
│   └── 📄 tailwind.config.ts # Tailwind CSS configuration
	# Removed devops/docker directory as per user request
├── 📄 vercel.json         # Vercel deployment configuration
├── 📄 render.yaml         # Render deployment configuration
└── 📄 README.md           # Project documentation
```

## 🌟 Key Features

### **E-Commerce Functionality**
- 🛍️ Product catalog with categories (Incense Sticks, A2 Cow Ghee)
- 🛒 Shopping cart with persistent state
- 💳 UPI payment integration for Indian market
- 📧 Order confirmation emails

### **User Management**
- 👤 Complete user authentication system
- 🔐 Password reset via email
- 🛡️ Two-factor authentication (2FA)
- 📝 Profile management with avatar uploads
- 📍 Multiple address management

### **Modern UI/UX**
- 📱 Fully responsive design (mobile-first approach)
- 🌙 Dark/Light theme with user preferences
- 🎨 Custom design system with brand colors
- ⚡ Fast loading with optimized images
- 🔔 Toast notifications for user feedback

### **Business Features**
- 📧 Newsletter subscription system
- 📍 Store locator with Google Maps integration
- 📊 User analytics and preferences
- 🎯 SEO-optimized pages
- 📈 Performance monitoring
