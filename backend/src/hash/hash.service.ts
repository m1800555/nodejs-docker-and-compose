import { Injectable } from '@nestjs/common';
import { compare, hash, genSalt } from 'bcrypt';

@Injectable()
export class HashService {
  async getHash(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }

  async verifyHash(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
  }
}
