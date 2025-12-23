import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { BASE_URL } from "@/test/mocks/handlers";
import { createProfileDetails, type ProfileDetailsInput } from "./createProfileDetails";
import { HttpError, NetworkError } from "../client";

const validProfileInput: ProfileDetailsInput = {
  firstName: "John",
  lastName: "Doe",
  corporationNumber: "12345678",
  phone: "+11234567890",
};

describe("createProfileDetails", () => {
  describe("successful responses", () => {
    it("creates profile and returns the created data", async () => {
      server.use(
        http.post(`${BASE_URL}/profile-details`, async ({ request }) => {
          const body = (await request.json()) as ProfileDetailsInput;
          return HttpResponse.json({
            firstName: body.firstName,
            lastName: body.lastName,
            corporationNumber: body.corporationNumber,
            phone: body.phone,
          });
        })
      );

      await createProfileDetails(validProfileInput);
    });

    it("handles different valid inputs", async () => {
      server.use(
        http.post(`${BASE_URL}/profile-details`, async ({ request }) => {
          const body = (await request.json()) as ProfileDetailsInput;
          return HttpResponse.json(body);
        })
      );

      const input: ProfileDetailsInput = {
        firstName: "Jane",
        lastName: "Smith",
        corporationNumber: "87654321",
        phone: "+19876543210",
      };

      await createProfileDetails(input);
    });
  });

  describe("error handling", () => {
    it("throws HttpError on 400 Bad Request", async () => {
      server.use(
        http.post(`${BASE_URL}/profile-details`, () => {
          return HttpResponse.json({ message: "Invalid input data" }, { status: 400 });
        })
      );

      await expect(createProfileDetails(validProfileInput)).rejects.toThrow(HttpError);

      try {
        await createProfileDetails(validProfileInput);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        const httpError = error as HttpError;
        expect(httpError.status).toBe(400);
        expect(httpError.message).toBe("Invalid input data");
      }
    });

    it("throws HttpError on 409 Conflict (duplicate)", async () => {
      server.use(
        http.post(`${BASE_URL}/profile-details`, () => {
          return HttpResponse.json({ message: "Profile already exists" }, { status: 409 });
        })
      );

      await expect(createProfileDetails(validProfileInput)).rejects.toThrow(HttpError);

      try {
        await createProfileDetails(validProfileInput);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        const httpError = error as HttpError;
        expect(httpError.status).toBe(409);
        expect(httpError.message).toBe("Profile already exists");
      }
    });

    it("throws HttpError on 500 Internal Server Error", async () => {
      server.use(
        http.post(`${BASE_URL}/profile-details`, () => {
          return HttpResponse.json({ message: "Internal server error" }, { status: 500 });
        })
      );

      await expect(createProfileDetails(validProfileInput)).rejects.toThrow(HttpError);

      try {
        await createProfileDetails(validProfileInput);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        const httpError = error as HttpError;
        expect(httpError.status).toBe(500);
      }
    });

    it("throws HttpError when response has invalid phone format", async () => {
      server.use(
        http.post(`${BASE_URL}/profile-details`, () => {
          return HttpResponse.json(
            {
              firstName: "John",
              lastName: "Doe",
              corporationNumber: "12345678",
              phone: "invalid-phone", // Invalid format
            },
            { status: 400 }
          );
        })
      );

      await expect(createProfileDetails(validProfileInput)).rejects.toThrow(HttpError);
    });

    it("throws NetworkError on network failure", async () => {
      server.use(
        http.post(`${BASE_URL}/profile-details`, () => {
          return HttpResponse.error();
        })
      );

      await expect(createProfileDetails(validProfileInput)).rejects.toThrow(NetworkError);
    });
  });

  describe("request format", () => {
    it("sends profile data as JSON body", async () => {
      let capturedBody: ProfileDetailsInput | undefined;

      server.use(
        http.post(`${BASE_URL}/profile-details`, async ({ request }) => {
          capturedBody = (await request.json()) as ProfileDetailsInput;
          return HttpResponse.json(capturedBody);
        })
      );

      await createProfileDetails(validProfileInput);

      expect(capturedBody).toEqual(validProfileInput);
    });

    it("sends correct Content-Type header", async () => {
      let capturedContentType: string | null = null;

      server.use(
        http.post(`${BASE_URL}/profile-details`, async ({ request }) => {
          capturedContentType = request.headers.get("Content-Type");
          const body = (await request.json()) as ProfileDetailsInput;
          return HttpResponse.json(body);
        })
      );

      await createProfileDetails(validProfileInput);

      expect(capturedContentType).toContain("application/json");
    });
  });
});
