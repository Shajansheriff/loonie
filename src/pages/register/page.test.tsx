import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "./page";

// Mock the API methods
vi.mock("@/api/methods/validateCorporationNumber", () => ({
  validateCorporationNumber: vi.fn(),
}));

vi.mock("@/api/methods/createProfileDetails", () => ({
  createProfileDetails: vi.fn(),
}));

import { validateCorporationNumber } from "@/api/methods/validateCorporationNumber";
import {
  createProfileDetails,
  type ProfileDetailsResponse,
} from "@/api/methods/createProfileDetails";
import { assertHtmlInputElement } from "@/test/helpers";

const mockedValidateCorporationNumber = vi.mocked(validateCorporationNumber);
const mockedCreateProfileDetails = vi.mocked(createProfileDetails);

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return {
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
    queryClient,
  };
}

function getInputByLabelText(label: RegExp) {
  return screen.getByLabelText(label);
}

function getFirstNameInput() {
  return getInputByLabelText(/first name/i);
}

function getLastNameInput() {
  return getInputByLabelText(/last name/i);
}

function getPhoneInput() {
  return getInputByLabelText(/phone number/i);
}

function getCorporationNumberInput() {
  return getInputByLabelText(/corporation number/i);
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /submit/i });
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    renderWithProviders(<RegisterPage />);

    expect(getFirstNameInput()).toBeVisible();
    expect(getFirstNameInput()).toBeEnabled();
    expect(getLastNameInput()).toBeVisible();
    expect(getLastNameInput()).toBeEnabled();
    expect(getPhoneInput()).toBeVisible();
    expect(getPhoneInput()).toBeEnabled();
    expect(getCorporationNumberInput()).toBeVisible();
    expect(getCorporationNumberInput()).toBeEnabled();
    expect(getSubmitButton()).toBeVisible();
    expect(getSubmitButton()).toBeEnabled();
  });

  it("shows validation error for empty first name on blur", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const firstNameInput = getFirstNameInput();

    await user.click(firstNameInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText("Required")).toBeInTheDocument();
    });
  });

  it("shows validation error for first name exceeding max length", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const firstNameInput = getFirstNameInput();

    await user.type(firstNameInput, "a".repeat(51));
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText("Max 50 characters")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid phone format", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const phoneInput = getPhoneInput();

    await user.type(phoneInput, "1234567890");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText("Invalid format")).toBeInTheDocument();
    });
  });

  it("accepts valid phone number format", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const phoneInput = getPhoneInput();

    await user.type(phoneInput, "+11234567890");
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText("Invalid format")).not.toBeInTheDocument();
    });
  });

  it("shows validation error for corporation number not 9 digits", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const corpNumberInput = getCorporationNumberInput();

    await user.type(corpNumberInput, "12345");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText("Must be 9 digits")).toBeInTheDocument();
    });
  });

  it("only allows numeric input in corporation number field", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const corpNumberInput = getCorporationNumberInput();
    assertHtmlInputElement(corpNumberInput);

    await user.type(corpNumberInput, "abc123def456");

    expect(corpNumberInput.value).toBe("123456");
  });

  it("validates corporation number against API and shows error for invalid", async () => {
    mockedValidateCorporationNumber.mockResolvedValue({
      corporationNumber: "123456789",
      valid: false,
    });
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const corpNumberInput = getCorporationNumberInput();

    await user.type(corpNumberInput, "123456789");
    await user.tab();

    await waitFor(() => {
      expect(mockedValidateCorporationNumber).toHaveBeenCalledWith("123456789");
    });
    await waitFor(() => {
      expect(screen.getByText("Invalid corporation number")).toBeInTheDocument();
    });
  });

  it("validates corporation number against API and accepts valid", async () => {
    mockedValidateCorporationNumber.mockResolvedValue({
      corporationNumber: "123456789",
      valid: true,
    });
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const corpNumberInput = getCorporationNumberInput();

    await user.type(corpNumberInput, "123456789");
    await user.tab();

    await waitFor(() => {
      expect(mockedValidateCorporationNumber).toHaveBeenCalledWith("123456789");
    });
    await waitFor(() => {
      expect(screen.queryByText("Invalid corporation number")).not.toBeInTheDocument();
    });
  });

  it("validates no multiple calls to the API for the same corporation number", async () => {
    mockedValidateCorporationNumber.mockResolvedValue({
      corporationNumber: "123456789",
      valid: true,
    });
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const corpNumberInput = getCorporationNumberInput();

    await user.type(corpNumberInput, "123456789");
    await user.tab();

    await waitFor(() => {
      expect(mockedValidateCorporationNumber).toHaveBeenCalledWith("123456789");
    });

    await user.click(getSubmitButton()); // submit the form

    await waitFor(() => {
      expect(mockedValidateCorporationNumber).toHaveBeenCalledTimes(1);
    });

    await user.type(corpNumberInput, "123456788");
    await user.tab();
    await waitFor(() => {
      expect(mockedValidateCorporationNumber).toHaveBeenCalledTimes(1);
    });

    await user.click(getSubmitButton()); // submit the form

    await waitFor(() => {
      expect(mockedValidateCorporationNumber).toHaveBeenCalledTimes(1);
    });

    await user.type(corpNumberInput, "123456789");
    await user.tab();

    await waitFor(() => {
      expect(mockedValidateCorporationNumber).toHaveBeenCalledTimes(1);
    });
  });

  it("submits form with valid data", async () => {
    mockedValidateCorporationNumber.mockResolvedValue({
      corporationNumber: "123456789",
      valid: true,
    });
    mockedCreateProfileDetails.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      corporationNumber: "12345678",
      phone: "+11234567890",
    });
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await user.type(getFirstNameInput(), "John");
    await user.type(getLastNameInput(), "Doe");
    await user.type(getPhoneInput(), "+11234567890");
    await user.type(getCorporationNumberInput(), "123456789");
    await user.tab();
    await waitFor(() => {
      expect(mockedValidateCorporationNumber).toHaveBeenCalled();
    });
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedCreateProfileDetails).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        phone: "+11234567890",
        corporationNumber: "123456789",
      });
    });
  });

  it("disables submit button while submitting", async () => {
    mockedValidateCorporationNumber.mockResolvedValue({
      corporationNumber: "123456789",
      valid: true,
    });
    const submitPromise = new Promise<ProfileDetailsResponse>((resolve) => {
      // wait for 200ms before resolving to simulate a API call delay
      setTimeout(() => {
        resolve({
          firstName: "John",
          lastName: "Doe",
          corporationNumber: "123456789",
          phone: "+11234567890",
        });
      }, 200);
    });
    mockedCreateProfileDetails.mockImplementation(() => submitPromise);
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await user.type(getFirstNameInput(), "John");
    await user.type(getLastNameInput(), "Doe");
    await user.type(getPhoneInput(), "+11234567890");
    await user.type(getCorporationNumberInput(), "123456789");
    await user.tab(); // Blur to trigger async validation
    await waitFor(() => {
      expect(mockedValidateCorporationNumber).toHaveBeenCalled();
    });
    const submitButton = getSubmitButton();
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("handles API error during corporation number validation", async () => {
    mockedValidateCorporationNumber.mockRejectedValue(new Error("API Error"));
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);
    const corpNumberInput = getCorporationNumberInput();

    await user.type(corpNumberInput, "123456789");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText("Invalid corporation number")).toBeInTheDocument();
    });
  });
});
