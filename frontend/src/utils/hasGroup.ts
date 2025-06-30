import type { UserState } from "../store/userSlice";


export const hasGroup = (group: string, user: UserState) => {
    if (!user.groups!.includes(group)) return false

    return true
}