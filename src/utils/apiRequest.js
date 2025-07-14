export const apiRequest = async (
  endpoint,
  method = "POST",
  payload = {},
  extraHeaders = {}
  // headers = {
  //   "Content-Type": "application/json",
  //   "access-token": "G6-Voice-API-KEY",
  // }
) => {
  try {
    const url = "https://websolutioncanada.com:6902";
    // const url = "http://192.168.29.243:6900";

    const isFormData = payload instanceof FormData;

    const headers = isFormData
      ? { "access-token": "G6-Voice-API-KEY", ...extraHeaders }
      : {
          "Content-Type": "application/json",
          "access-token": "G6-Voice-API-KEY",
          ...extraHeaders,
        };

    const response = await fetch(`${url}/${endpoint}`, {
      method,
      headers,
      // body: method !== "GET" ? JSON.stringify(payload) : undefined,
      body:
        method !== "GET"
          ? isFormData
            ? payload
            : JSON.stringify(payload)
          : undefined,
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    return null;
  }
};
