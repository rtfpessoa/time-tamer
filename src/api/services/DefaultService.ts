/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Error } from '../models/Error';
import type { User } from '../models/User';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * Returns the authenticated user
     * @returns User user response
     * @returns Error unexpected error
     * @throws ApiError
     */
    public static userInfo(): CancelablePromise<User | Error> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/me',
        });
    }

}
