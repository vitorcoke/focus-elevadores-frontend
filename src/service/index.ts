import axios from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'
import {parseCookies, setCookie} from 'nookies'


const URL_SERVER = process.env.NEXT_PUBLIC_URL_SERVER 
export const getAPIClient = (ctx?: any) => {
    const {'focus-elevador-token': token, 'focus-elevador-refreshToken': refresh_token} = parseCookies(ctx)
    
    const axiosInstance = axios.create({
        baseURL: URL_SERVER
    })

    if(token){
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }   



    if(refresh_token){
        createAuthRefreshInterceptor(axiosInstance, (failedRequest) => 
            axiosInstance
            .post('/refresh-token', {refreshTokenId : refresh_token})
            .then(
                async (response) => {
                    failedRequest.response.config.headers[
                        'Authorization'
                      ] = `Bearer ${response.data.token}`;
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                    setCookie(ctx, 'focus-elevador-token', response.data.token, {
                        maxAge: 60 * 60 * 24, //24hrs
                        path: '/'
                    })
                    return Promise.resolve()
                }
            )
            .catch((error) => {
                Promise.reject(error)   
            }),
            {statusCodes: [401]}
        )
    }
    
    return axiosInstance
}

export const api = getAPIClient()
