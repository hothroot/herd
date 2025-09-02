import fetch from 'node-fetch';
import { RECAPTCHA_SECRET_KEY } from "astro:env/server";


export default async function validateCaptcha(captchaToken) {
    if (captchaToken === null || captchaToken === "") {
        return false;
    }

    try { 
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
        const response = await fetch(verificationUrl, { method: 'POST' });
        const data = await response.json();
         return data.success;
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return false;
    }
};