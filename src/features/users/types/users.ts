export interface User {
    id: string
    username: string
    email: string
}

export interface GetProfileResponse{
    data: User
}

export interface UpdateProfilePayload {
    username: string
    email: string
}