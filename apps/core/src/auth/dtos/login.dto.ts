import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/users.schema";

export class LoginResponseDto {

    @ApiProperty({ description: "the user' email" })
    id: string

    @ApiProperty({ description: "the user' name" })
    name: string;

    @ApiProperty({ description: "the user' lastname" })
    lastname: string;

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

    activeOtp: boolean;

    zoneId: string;

    constructor(user: User) {
        this.id = user.id;
        this.name = user.name;
        this.lastname = user.lastname;
        this.email = user.email;
        this.phone = user.phone;
        this.role = user.role;
        this.companyId = user.companyId;
        this.active = user.active;
        this.activeOtp = user.activeOtp; {
        this.zoneId = user.zoneId.toString();
        }
    }

}