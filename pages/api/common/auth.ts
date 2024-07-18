import { dateToUnixSeconds } from './time'
import jwt from 'jsonwebtoken'

const JWT_ISSER = "https://circle-employee-anniversary-nft.vercel.app"
const JWT_VALIDITY_TIME_SECONDS = 24 * 60 * 60;   // 1 day
const JWT_ES256_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEXgyZWPsr5NdzZuY19BEcxLy2pWHx
8/z2tBaDqfT3bfnNxQb3kiiSQU/c8iP36sB8iVkIT97Pg2LJJIXrchKVdA==
-----END PUBLIC KEY-----`;

export function generateUserJwt(userId: number) {
    if (!process.env.JWT_ES256_PRIVATE_KEY_BASE64) {
        throw new Error("JWT configuration environment variables are not set up correctly")
    }
    const jwtEs256PrivateKey = Buffer.from(process.env.JWT_ES256_PRIVATE_KEY_BASE64 , 'base64').toString('ascii');

    // Standard JWT fields (see https://jwt.io/introduction)
    let payload = {
        iss: JWT_ISSER,
        exp: dateToUnixSeconds(new Date()) + JWT_VALIDITY_TIME_SECONDS,
        sub: userId
    }
    return jwt.sign(payload, jwtEs256PrivateKey, { algorithm: 'ES256' });
}

// Verifies the JWT and returns the user ID from the JWT payload
function verifyUserJwt(tok: string): number | undefined {
    try {
        const payload = jwt.verify(tok, JWT_ES256_PUBLIC_KEY, { issuer: JWT_ISSER })
        // @ts-ignore
        return payload.sub
    } catch (err) {
        console.log("Encountered error during JWT verification", err);
        return;
    }
}

// Verifies the authorization header format and JWT, and returns the parsed user ID
export function verifyAuthorizationHeader(authorizationHeader: string | undefined): number | undefined {
    if (!authorizationHeader) {
        return
    }
    const [authType, jwtToken] = authorizationHeader.split(' ')
    if (authType.toLowerCase() !== "bearer") {
        return
    }
    return verifyUserJwt(jwtToken)
}