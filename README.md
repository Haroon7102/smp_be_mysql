#FYP
# Social Manager Pro

Social Manager Pro is a web-based platform that allows users to manage and schedule posts across multiple social media platforms such as Facebook and Instagram. The app also integrates AI-generated captions and provides an analytics dashboard for tracking post performance.

## Features
- **Multi-Platform Posting**: Post content to Facebook and Instagram from one interface.
- **AI-Generated Captions**: Automatically generate captions using AI for your social media posts.
- **Scheduling Posts**: Schedule posts in advance and manage them through a calendar interface.
- **Analytics Dashboard**: View metrics such as total posts, scheduled posts, posted content, and engagement (likes, etc.).
- **Social Media Integration**: Authenticate using Google or Facebook for seamless access.
  
## Tech Stack
- **Frontend**: React.js (deployed on Netlify)
- **Backend**: Node.js with Express (deployed on Vercel)
- **Database**: MySQL (Aiven Cloud)
- **Authentication**: OAuth2 with Google and Facebook
  
## Installation

### Prerequisites
- Node.js (version X.X.X or later)
- MySQL

### Backend Setup
1. Clone the repository:
    ```bash
    cd social-manager-pro/backend
    ```
2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the backend directory and add the following environment variables:
    ```bash
    

4. Start the backend server:
    ```bash
    npm run start
    ```

### Frontend Setup
1. Navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the frontend directory with:
    ```bash
    REACT_APP_BACKEND_URL=https://your-backend-url.vercel.app
    ```

4. Start the React app:
    ```bash
    npm start
    ```

## API Endpoints
### Authentication
- **POST** `/auth/google`: Redirects the user to Google OAuth for login.
- **POST** `/auth/facebook`: Redirects the user to Facebook OAuth for login.

### Posts
- **POST** `/api/posts`: Create a new post.
- **GET** `/api/posts`: Retrieve all posts for the authenticated user.
- **PUT** `/api/posts/:id`: Update an existing post.
- **DELETE** `/api/posts/:id`: Delete a post.

## Contributing
Feel free to open issues or submit pull requests for any feature suggestions or bugs.

## License
This project is licensed under the MIT License.
