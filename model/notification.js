const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true,  // Removes whitespace from both ends of the string
        minlength: 1  // Ensures the message has at least one character
      },
      type: {
        type: String,
        enum: ['info', 'warning', 'error'],  // Restricts the type to specific values
        default: 'info'  // Sets default type if none is provided
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'  // Assumes you have a User model
      }
    }, {
      timestamps: true  // Automatically adds createdAt and updatedAt fields
    });

module.exports = mongoose.model('Notification', notificationSchema);
