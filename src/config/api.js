/**
 * URL base da API. Definida em .env como REACT_APP_SERVER_URL.
 * Ex.: REACT_APP_SERVER_URL=http://localhost:3001
 * Em desenvolvimento com proxy (package.json), pode ser deixada em branco para usar o mesmo host.
 */
const baseURL = process.env.REACT_APP_SERVER_URL || "";

export default baseURL;
