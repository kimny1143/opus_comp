import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    id: string;
    role: string;
  }
} 