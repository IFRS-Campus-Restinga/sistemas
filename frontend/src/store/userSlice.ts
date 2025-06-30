import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
    id: string | null
    username: string | null;
    first_login: boolean | null;
    profile_picture?: string | null;
    groups: string[] | null;
}

const initialState: UserState = {
    id: null,
    first_login: null,
    groups: null,
    username: null,
    profile_picture: null
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (_, action: PayloadAction<UserState>) => action.payload,
        clearUser: () => {
            return {
                id: null,
                first_login: null,
                groups: null,
                username: null,
                profile_picture: null
            }
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
