import supertest from "supertest";
import { Application } from "express";
import { createApp } from "../../build/core/app";
import { issueJwt } from "./fixtures";
import { UserEntity } from "../../build/core/databases/entities/user.entity";

export async function buildTestApp(): Promise<Application> {
    return createApp();
}

export function authed(request: ReturnType<typeof supertest>, user: UserEntity) {
    return {
        get: (url: string) => request.get(url).set("Authorization", `Bearer ${issueJwt(user)}`),
        post: (url: string) => request.post(url).set("Authorization", `Bearer ${issueJwt(user)}`),
        put: (url: string) => request.put(url).set("Authorization", `Bearer ${issueJwt(user)}`),
        delete: (url: string) => request.delete(url).set("Authorization", `Bearer ${issueJwt(user)}`),
    };
}
