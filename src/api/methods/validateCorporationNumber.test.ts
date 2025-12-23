import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { BASE_URL } from "@/test/mocks/handlers";
import { validateCorporationNumber } from "./validateCorporationNumber";
import { HttpError, NetworkError, ValidationError } from "../client";

describe("validateCorporationNumber", () => {
  describe("successful responses", () => {
    it("returns valid=true for a valid corporation number", async () => {
      server.use(
        http.get(`${BASE_URL}/corporation-number/:corpNum`, ({ params }) => {
          return HttpResponse.json({
            corporationNumber: params.corpNum,
            valid: true,
          });
        })
      );

      const result = await validateCorporationNumber("123456789");

      expect(result).toEqual({
        corporationNumber: "123456789",
        valid: true,
      });
    });

    it("returns valid=false for an invalid corporation number", async () => {
      server.use(
        http.get(`${BASE_URL}/corporation-number/:corpNum`, ({ params }) => {
          return HttpResponse.json(
            {
              corporationNumber: params.corpNum,
              valid: false,
            },
            { status: 404 }
          );
        })
      );

      await expect(validateCorporationNumber("000000000")).rejects.toThrow(HttpError);
      try {
        await validateCorporationNumber("000000000");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        const httpError = error as HttpError;
        expect(httpError.status).toBe(404);
        expect(httpError.body).toEqual({
          corporationNumber: "000000000",
          valid: false,
        });
      }
    });
  });

  describe("error handling", () => {
    it("throws HttpError on 400 response", async () => {
      server.use(
        http.get(`${BASE_URL}/corporation-number/:corpNum`, () => {
          return HttpResponse.json({ message: "Invalid input data" }, { status: 400 });
        })
      );

      await expect(validateCorporationNumber("999999999")).rejects.toThrow(HttpError);

      try {
        await validateCorporationNumber("999999999");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        const httpError = error as HttpError;
        expect(httpError.status).toBe(400);
        expect(httpError.body).toEqual({
          message: "Invalid input data",
        });
      }
    });

    it("throws HttpError on 500 response", async () => {
      server.use(
        http.get(`${BASE_URL}/corporation-number/:corpNum`, () => {
          return HttpResponse.json({ message: "Internal server error" }, { status: 500 });
        })
      );

      await expect(validateCorporationNumber("123456789")).rejects.toThrow(HttpError);

      try {
        await validateCorporationNumber("123456789");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        const httpError = error as HttpError;
        expect(httpError.status).toBe(500);
      }
    });

    it("throws ValidationError when response doesn't match schema", async () => {
      server.use(
        http.get(`${BASE_URL}/corporation-number/:corpNum`, () => {
          // Missing required 'valid' field
          return HttpResponse.json({
            corporationNumber: "123456789",
          });
        })
      );

      await expect(validateCorporationNumber("123456789")).rejects.toThrow(ValidationError);

      try {
        await validateCorporationNumber("123456789");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.issues).toHaveLength(1);
        expect(validationError.issues[0].path).toBe("valid");
      }
    });

    it("throws NetworkError on network failure", async () => {
      server.use(
        http.get(`${BASE_URL}/corporation-number/:corpNum`, () => {
          return HttpResponse.error();
        })
      );

      await expect(validateCorporationNumber("123456789")).rejects.toThrow(NetworkError);
    });
  });

  describe("request format", () => {
    it("sends corporation number as URL parameter", async () => {
      let capturedCorpNum: string | undefined;

      server.use(
        http.get(`${BASE_URL}/corporation-number/:corpNum`, ({ params }) => {
          capturedCorpNum = params.corpNum as string;
          return HttpResponse.json({
            corporationNumber: params.corpNum,
            valid: true,
          });
        })
      );

      await validateCorporationNumber("987654321");

      expect(capturedCorpNum).toBe("987654321");
    });
  });
});
