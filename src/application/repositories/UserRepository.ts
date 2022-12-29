import { User } from "domain/entities/User";

export interface UserRepository{
    list:()=>Promise<User[]>
    create:(data:User)=>Promise<User>
    update:(data:User.Props)=>Promise<User>
    delete:(id:string)=>void
    findById:(id:string)=>Promise<User>
    findByEmail:(email:string)=>Promise<User>
}