const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

// Load environment variables from the parent directory of this source file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.string().transform((val) => parseInt(val, 10)).default('3306'),
  DB_USER: z.string().default('root'),
  DB_PASS: z.string().default('password'),
  DB_NAME: z.string().default('project_showcase'),
  
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
  JWT_EXPIRY: z.string().transform((val) => parseInt(val, 10)).default('86400'),
  
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  
  BYPASS_OAUTH: z.string()
    .transform((val) => val.toLowerCase() === 'true')
    .default('false'),
    
  MOCK_DATABASE: z.string()
    .transform((val) => val.toLowerCase() === 'true')
    .default('false')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

module.exports = parsed.data;
