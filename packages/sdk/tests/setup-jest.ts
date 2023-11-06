import dotenv from 'dotenv';
import path from 'path';
import 'isomorphic-unfetch';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});
