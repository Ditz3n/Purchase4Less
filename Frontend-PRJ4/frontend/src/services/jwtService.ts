import { jwtDecode } from 'jwt-decode';

// Funktion til at hente JWT token fra sessionStorage
export const getToken = () => {
    return sessionStorage.getItem("jwtToken");
};

// Funktion til at dekode JWT token og hente brugerens rolle
export const getUserRole = () => {
    const token = getToken();
    if (!token) {
        throw new Error("JWT token mangler");
    }

    const decodedToken: { role: string } = jwtDecode(token);
    return decodedToken.role;
};

// Hjælpefunktion til at lave autentificerede API-anmodninger med JWT token
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken(); // Hent JWT token
    if (!token) {
        throw new Error("JWT token mangler"); // Fejl hvis token ikke er tilgængelig
    }

    // Lav API-anmodning med token i Authorization headeren
    const response = await fetch(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            "Authorization": `Bearer ${token}` // Tilføj Authorization header med token
        }
    });

    if (!response.ok) {
        throw new Error("Fejl ved hentning af data"); // Fejl hvis anmodning mislykkes
    }

    return response.json(); // Returner svardata som JSON
};