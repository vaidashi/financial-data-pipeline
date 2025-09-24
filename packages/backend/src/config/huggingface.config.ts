import { registerAs } from '@nestjs/config';

export default registerAs('huggingface', () => ({
  apiKey: process.env.HUGGINGFACE_API_KEY,
}));
