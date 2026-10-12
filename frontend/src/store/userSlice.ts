import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
    id: string | null
    username: string | null;
    first_login: boolean | null;
    access_profile: string | null;
    profile_picture?: string | null;
    is_abstract: boolean | null;
    personal_infos: string | null;
    account_infos: string | null;
    groups: string[] | null;
    permissions: string[];
    bind_requests_count?: number;
}

const initialState: UserState = {
    id: null,
    first_login: null,
    access_profile: null,
    groups: null,
    is_abstract: null,
    personal_infos: null,
    account_infos: null,
    username: null,
    profile_picture: null,
    bind_requests_count: 0,
    permissions: []
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState>) => ({
            ...action.payload,
            bind_requests_count:
                action.payload.bind_requests_count ??
                (action.payload.id === state.id ? state.bind_requests_count : 0) ??
                0
        }),
        setBindRequestsCount: (state, action: PayloadAction<number>) => {
            state.bind_requests_count = action.payload
        },
        clearUser: () => {
            return {
                id: null,
                first_login: null,
                access_profile: null,
                is_abstract: null,
                personal_infos: null,
                account_infos: null,
                groups: null,
                username: null,
                profile_picture: null,
                bind_requests_count: 0,
                permissions: []
            }
        },
    },
});

export const { setUser, setBindRequestsCount, clearUser } = userSlice.actions;
export default userSlice.reducer;
