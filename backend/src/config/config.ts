import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'student',
    password: process.env.POSTGRES_PASSWORD || 'student',
    database: process.env.POSTGRES_DB || 'kupipodariday',
    entities: [Offer, User, Wish, Wishlist],
    synchronize: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'jwt_secret',
    ttl: process.env.JWT_TTL || '7d',
  },
});
