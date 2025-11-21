import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly staticLogin: string;
  private readonly staticPassword: string;
  private readonly pregeneratedToken: string;

  constructor(private configService: ConfigService) {
    const login = this.configService.get<string>('AUTH_LOGIN');
    const password = this.configService.get<string>('AUTH_PASSWORD');
    const token = this.configService.get<string>('AUTH_TOKEN');

    if (!login) {
      throw new Error('AUTH_LOGIN environment variable is required');
    }
    if (!password) {
      throw new Error('AUTH_PASSWORD environment variable is required');
    }
    if (!token) {
      throw new Error('AUTH_TOKEN environment variable is required');
    }

    this.staticLogin = login;
    this.staticPassword = password;
    this.pregeneratedToken = token;
  }

  validateCredentials(login: string, password: string): boolean {
    return login === this.staticLogin && password === this.staticPassword;
  }

  login(login: string, password: string): { token: string } {
    if (!this.validateCredentials(login, password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { token: this.pregeneratedToken };
  }

  validateToken(token: string): boolean {
    return token === this.pregeneratedToken;
  }
}
