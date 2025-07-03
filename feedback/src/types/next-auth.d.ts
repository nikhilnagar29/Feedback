import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      _id?: string;
      username?: string;
      email?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
    }
  }

  interface User {
    _id?: string;
    username?: string;
    email?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}

declare module 'next/server' {
  interface NextRequest {
    ip?: string;
  }
}