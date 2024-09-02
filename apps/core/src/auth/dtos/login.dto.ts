import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/users.schema";

export class LoginResponseDto {

    @ApiProperty({ description: "the user' email" })
    id: string

    @ApiProperty({ description: "the user' email" })
    email: string;

    @ApiProperty({ description: "the user' phone" })
    phone: string;

    @ApiProperty({ description: "the user' role" })
    role: string;

    @ApiProperty({ description: "the user' company" })
    companyId: string;

    @ApiProperty({ description: "the user' active" })
    active: boolean;

    constructor(user:User) {
        this.id = user.id;
        this.email = user.email;
        this.phone = user.phone;
        this.role = user.role;
        this.companyId = user.companyId;
        this.active = user.active; 
    }

}