import { useCallback } from 'react';
import { useSelector, useDispatch, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { setUser, setBindRequestsCount, clearUser, type UserState } from './userSlice';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useUser = () => useAppSelector((state: RootState) => state.user);

export const useSetUser = () => {
    const dispatch = useAppDispatch();
    return (userData: UserState) => {
        dispatch(setUser(userData));
    };
};

export const useSetBindRequestsCount = () => {
    const dispatch = useAppDispatch();
    return useCallback((count: number) => {
        dispatch(setBindRequestsCount(count));
    }, [dispatch]);
};

export const useClearUser = () => {
    const dispatch = useAppDispatch();
    return () => {
        dispatch(clearUser());
    };
};