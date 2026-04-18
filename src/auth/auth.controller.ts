import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user_login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh_token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() userDto: UserLoginDto) {
        return this.authService.login(userDto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refreshToken(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto);
    }
}
