import { ApiProperty } from "@nestjs/swagger";
import { Types } from 'mongoose';
import { IUser, User } from "../../users/users.schema";
import { RoleUserDocument } from "../../role-user/role-user.schema";

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
    roleId: string[] | Types.ObjectId[];

    @ApiProperty({ description: "the user' company" })
    companyId: string;

    @ApiProperty({ description: "the user' active" })
    active: boolean;

    activeOtp: boolean;

    skipOtp: boolean;

    zoneId: string[];

    role : RoleUserDocument[] | null;

    constructor(user: IUser) {
        this.id = user._id?.toString();
        this.name = user.name;
        this.lastname = user.lastname;
        this.email = user.email;
        this.phone = user.phone;
        let rIds = Array.isArray(user.roleId) ? user.roleId : (user.roleId ? [user.roleId] : []);
        this.roleId = rIds.map((r: any) => r._id ? r._id.toString() : r.toString());
        
        this.companyId = user.companyId?.toString();
        this.active = user.active;
        this.activeOtp = user.activeOtp;
        this.skipOtp = user.skipOtp ?? false;

        let zIds = Array.isArray(user.zoneId) ? user.zoneId : (user.zoneId ? [user.zoneId] : []);
        this.zoneId = zIds.map((z: any) => z._id ? z._id.toString() : z.toString());
        
        this.role = Array.isArray(user.role) ? user.role : (user.role ? [user.role] : []);
    }

}