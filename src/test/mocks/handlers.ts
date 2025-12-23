import { http, HttpResponse } from "msw";

export const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3000";

export const handlers = [
  // Validate Corporation Number
  http.get(`${BASE_URL}/corporation-number/:corporationNumber`, ({ params }) => {
    const { corporationNumber } = params;

    // Default mock: return valid for specific test numbers
    if (corporationNumber === "123456789") {
      return HttpResponse.json({
        corporationNumber,
        valid: true,
      });
    }

    if (corporationNumber === "000000000") {
      return HttpResponse.json({
        corporationNumber,
        valid: false,
      });
    }

    // Default: valid
    return HttpResponse.json({
      corporationNumber,
      valid: true,
    });
  }),

  // Create Profile Details
  http.post(`${BASE_URL}/profile-details`, async ({ request }) => {
    const body = (await request.json()) as {
      firstName: string;
      lastName: string;
      corporationNumber: string;
      phone: string;
    };

    return HttpResponse.json({
      firstName: body.firstName,
      lastName: body.lastName,
      corporationNumber: body.corporationNumber,
      phone: body.phone,
    });
  }),
];
