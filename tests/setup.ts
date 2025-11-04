import dotenv from 'dotenv';

// Load environment variables from .env.development for testing
// Jest automatically sets NODE_ENV to 'test', so we specify the path.
dotenv.config({ path: '.env.development' });