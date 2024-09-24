const bcrypt = require('bcryptjs');

// The password you want to test
const plainPassword = 'haroon1234';

// The stored hashed password from your database
const storedHashedPassword = '$2a$10$Y3OZpCbIgzfTkrQhInP8Uu2iv/0x1OCT2ngFFpJAhLcYfnoJ8cgEi';

// Manually hash the plain password (for comparison)
bcrypt.hash(plainPassword, 10, (err, generatedHash) => {
    if (err) throw err;

    console.log('Generated hashed password:', generatedHash);

    // Compare the plain password with the stored hashed password
    bcrypt.compare(plainPassword, storedHashedPassword, (err, isMatch) => {
        if (err) throw err;

        console.log('Does the entered password match the stored hash?:', isMatch);
    });
});
