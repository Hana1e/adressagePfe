import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('secure-data')
export class SecureDataController {
    constructor() {}

    @Get()
    @UseGuards(AuthGuard('jwt'))  
    getSecureData(@Request() req) {
        
        return {
            message: "This is secure data only accessible to authenticated users.",
            user: req.user
        };
    }
}