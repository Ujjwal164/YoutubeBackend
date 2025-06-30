import dotenv from 'dotenv';
import connectDb from './db/index.js';
import {app} from './app.js'
const port = process.env.PORT || 8000; // Set the port from environment variable or default to 8000

dotenv.config({
    path: './.env' // Specify the path to your .env file
}); // Load environment variables from .env file
connectDb() // here we are calling the connectDb function to connect to the database
.then(() => {
  app.listen(port, () => {
  console.log(`The app listening on port ${port}`)
})
})
.catch((error) => {
    console.error('Error in connnecting to the database:', error);
});