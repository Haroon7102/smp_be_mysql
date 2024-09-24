// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const passport = require('./auth/passport');
// const authRoutes = require('./auth/authRoutes');
// const { sequelize } = require('./models');
// const authMiddleware = require('./middleware/middleware'); // Import the middleware
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(bodyParser.json());
// app.use(passport.initialize());

// // Public Route
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// // Authentication Routes
// app.use('/auth', authRoutes);

// // Example of a protected route
// app.get('/protected', authMiddleware, (req, res) => {
//     res.json({
//         message: 'This is a protected route.',
//         user: req.user // This contains the decoded JWT payload (e.g., user information)
//     });
// });

// sequelize.authenticate()
//     .then(() => {
//         console.log('Database connected...');
//         app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//     })
//     .catch(err => console.log('Error: ' + err));
