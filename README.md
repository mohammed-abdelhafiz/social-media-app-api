# Postinger Social Media App Backend

This is the backend API for the Postinger Social Media App, built with Node.js and TypeScript. It provides RESTful endpoints for user authentication, posts, comments, likes, and follows, and is designed for scalability and maintainability.

## Features

- User registration, login, and authentication (JWT-based)
- Post creation, retrieval, updating, and deletion
- Commenting on posts
- Like/unlike functionality for posts and comments
- Follow/unfollow users
- Email notifications (e.g., for registration)
- File uploads (e.g., images via Cloudinary)
- Modular code structure for easy maintenance

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript**
- **MongoDB** (with Mongoose)
- **JWT** for authentication
- **Cloudinary** for media storage
- **Nodemailer** for email services
- **Docker** support

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mohammed-abdelhafiz/social-media-app-api.git
   cd social-media-app-api/backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your configuration (see below).

### Environment Variables

Create a `.env` file in the root directory. Example variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

**Do not commit your `.env` file or any secrets to version control.**

### Running the Server

- **Development:**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm run build
  npm start
  ```

### Docker

To run the backend in a Docker container:

```bash
docker build -t postinger-backend .
docker run -p 3000:3000 --env-file .env postinger-backend
```

## API Endpoints

The API is organized into modules:

- `/api/auth` — Authentication routes
- `/api/users` — User management and follow system
- `/api/posts` — Post CRUD and likes
- `/api/comments` — Comment CRUD and likes

Refer to the route files in `src/modules/` for detailed endpoints and request/response formats.

## Project Structure

```
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── routes.ts
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── posts/
│       └── comments/
│   └── shared/
│       ├── config/
│       ├── middlewares/
│       ├── services/
│       ├── types/
│       └── utils/
├── package.json
├── tsconfig.json
├── Dockerfile
└── ...
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.
