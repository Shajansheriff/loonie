import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OnboardingPage from "./page";

// Mock the API methods
vi.mock("@/api/methods/validateCorporationNumber", () => ({
  validateCorporationNumber: vi.fn(),
}));

vi.mock("@/api/methods/createProfileDetails", () => ({
  createProfileDetails: vi.fn(),
}));

import { validateCorporationNumber } from "@/api/methods/validateCorporationNumber";
import { createProfileDetails } from "@/api/methods/createProfileDetails";
import { assertHtmlInputElement } from "@/test/helpers";
import { HttpError } from "@/api/client";

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

function getBusinessNameInput() {
  return getInputByLabelText(/business name/i);
}

function getFirstTaxYearInput() {
  return getInputByLabelText(/first registered tax year/i);
}

function getRevenueRangeTrigger() {
  // The Select component uses a combobox role
  return screen.getByRole("combobox");
}

function getContinueButton() {
  return screen.getByRole("button", { name: /continue/i });
}

function getBackButton() {
  return screen.getByRole("button", { name: /back/i });
}

function getGoToDashboardButton() {
  return screen.getByRole("button", { name: /go to dashboard/i });
}

describe("OnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Step 1: Profile Form", () => {
    it("renders all profile form fields", () => {
      renderWithProviders(<OnboardingPage />);

      expect(getFirstNameInput()).toBeVisible();
      expect(getFirstNameInput()).toBeEnabled();
      expect(getLastNameInput()).toBeVisible();
      expect(getLastNameInput()).toBeEnabled();
      expect(getPhoneInput()).toBeVisible();
      expect(getPhoneInput()).toBeEnabled();
      expect(getCorporationNumberInput()).toBeVisible();
      expect(getCorporationNumberInput()).toBeEnabled();
      expect(getContinueButton()).toBeVisible();
      expect(getContinueButton()).toBeEnabled();
    });

    it("shows validation error for empty first name on blur", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      const firstNameInput = getFirstNameInput();

      await user.click(firstNameInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Required")).toBeInTheDocument();
      });
    });

    it("shows validation error for first name exceeding max length", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      const firstNameInput = getFirstNameInput();

      await user.type(firstNameInput, "a".repeat(51));
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Max 50 characters")).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid phone format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      const phoneInput = getPhoneInput();

      await user.type(phoneInput, "1234567890");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Invalid format")).toBeInTheDocument();
      });
    });

    it("accepts valid phone number format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      const phoneInput = getPhoneInput();

      await user.type(phoneInput, "+11234567890");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText("Invalid format")).not.toBeInTheDocument();
      });
    });

    it("shows validation error for corporation number not 9 digits", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      const corpNumberInput = getCorporationNumberInput();

      await user.type(corpNumberInput, "12345");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Must be 9 digits")).toBeInTheDocument();
      });
    });

    it("only allows numeric input in corporation number field", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
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
      renderWithProviders(<OnboardingPage />);
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
      renderWithProviders(<OnboardingPage />);
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
      renderWithProviders(<OnboardingPage />);
      const corpNumberInput = getCorporationNumberInput();

      await user.type(corpNumberInput, "123456789");
      await user.tab();

      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalledWith("123456789");
      });

      await user.click(getContinueButton()); // submit the form

      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalledTimes(1);
      });

      await user.type(corpNumberInput, "123456788");
      await user.tab();
      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalledTimes(1);
      });

      await user.click(getContinueButton()); // submit the form

      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalledTimes(1);
      });

      await user.type(corpNumberInput, "123456789");
      await user.tab();

      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalledTimes(1);
      });
    });

    it("submits profile form with valid data and advances to step 2", async () => {
      mockedValidateCorporationNumber.mockResolvedValue({
        corporationNumber: "123456789",
        valid: true,
      });
      mockedCreateProfileDetails.mockResolvedValue(void 0);

      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);

      await user.type(getFirstNameInput(), "John");
      await user.type(getLastNameInput(), "Doe");
      await user.type(getPhoneInput(), "+11234567890");
      await user.type(getCorporationNumberInput(), "123456789");
      await user.tab();
      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalled();
      });
      await user.click(getContinueButton());

      await waitFor(() => {
        expect(mockedCreateProfileDetails).toHaveBeenCalledWith({
          firstName: "John",
          lastName: "Doe",
          phone: "+11234567890",
          corporationNumber: "123456789",
        });
      });

      // Should advance to step 2
      await waitFor(() => {
        expect(getBusinessNameInput()).toBeVisible();
      });
    });

    it.skip("disables continue button while submitting", async () => {
      mockedValidateCorporationNumber.mockResolvedValue({
        corporationNumber: "123456789",
        valid: true,
      });

      // Create a deferred promise we can resolve manually to simulate a API call delay
      let resolveSubmit!: (value: PromiseLike<undefined> | undefined) => void
      const submitPromise = new Promise<undefined>((resolve) => {
        resolveSubmit = resolve;
      });
      mockedCreateProfileDetails.mockImplementation(() => submitPromise);

      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);

      await user.type(getFirstNameInput(), "John");
      await user.type(getLastNameInput(), "Doe");
      await user.type(getPhoneInput(), "+11234567890");
      await user.type(getCorporationNumberInput(), "123456789");
      await user.tab(); // Blur to trigger async validation
      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalled();
      });
      const continueButton = getContinueButton();
      await user.click(continueButton);

      // Wait for the button to become disabled while the promise is pending
      await waitFor(() => {
        expect(continueButton).toBeDisabled();
      });

      // Resolve the promise to simulate the API call completing
      resolveSubmit(undefined);

      // After success, we advance to step 2
      await waitFor(() => {
        expect(getBusinessNameInput()).toBeVisible();
      });
    });

    it("handles API error during corporation number validation", async () => {
      mockedValidateCorporationNumber.mockRejectedValue(new Error("API Error"));
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      const corpNumberInput = getCorporationNumberInput();

      await user.type(corpNumberInput, "123456789");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Invalid corporation number")).toBeInTheDocument();
      });
    });

    it("displays backend error message when submission fails with 400", async () => {
      mockedValidateCorporationNumber.mockResolvedValue({
        corporationNumber: "123456789",
        valid: true,
      });
      mockedCreateProfileDetails.mockRejectedValue(
        new HttpError(400, "Invalid phone number", { message: "Invalid phone number" })
      );
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);

      await user.type(getFirstNameInput(), "John");
      await user.type(getLastNameInput(), "Doe");
      await user.type(getPhoneInput(), "+11234567890");
      await user.type(getCorporationNumberInput(), "123456789");
      await user.tab();
      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalled();
      });

      await user.click(getContinueButton());

      await waitFor(() => {
        expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
      });
    });

    it("displays generic error message when submission fails with unexpected error", async () => {
      mockedValidateCorporationNumber.mockResolvedValue({
        corporationNumber: "123456789",
        valid: true,
      });
      mockedCreateProfileDetails.mockRejectedValue(new Error("Network failure"));
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);

      await user.type(getFirstNameInput(), "John");
      await user.type(getLastNameInput(), "Doe");
      await user.type(getPhoneInput(), "+11234567890");
      await user.type(getCorporationNumberInput(), "123456789");
      await user.tab();
      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalled();
      });

      await user.click(getContinueButton());

      await waitFor(() => {
        expect(
          screen.getByText("An unexpected error occurred. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("clears form error when resubmitting", async () => {
      mockedValidateCorporationNumber.mockResolvedValue({
        corporationNumber: "123456789",
        valid: true,
      });
      // First submission fails
      mockedCreateProfileDetails.mockRejectedValueOnce(
        new HttpError(400, "Invalid phone number", { message: "Invalid phone number" })
      );
      // Second submission succeeds
      mockedCreateProfileDetails.mockResolvedValueOnce(void 0);

      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);

      await user.type(getFirstNameInput(), "John");
      await user.type(getLastNameInput(), "Doe");
      await user.type(getPhoneInput(), "+11234567890");
      await user.type(getCorporationNumberInput(), "123456789");
      await user.tab();
      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalled();
      });

      // First submit - should show error
      await user.click(getContinueButton());
      await waitFor(() => {
        expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
      });

      // Second submit - error should be cleared
      await user.click(getContinueButton());
      await waitFor(() => {
        expect(screen.queryByText("Invalid phone number")).not.toBeInTheDocument();
      });
    });
  });

  describe.skip("Step 2: Business Details Form", () => {
    async function advanceToStep2(user: ReturnType<typeof userEvent.setup>) {
      mockedValidateCorporationNumber.mockResolvedValue({
        corporationNumber: "123456789",
        valid: true,
      });
      mockedCreateProfileDetails.mockResolvedValue(void 0);

      await user.type(getFirstNameInput(), "John");
      await user.type(getLastNameInput(), "Doe");
      await user.type(getPhoneInput(), "+11234567890");
      await user.type(getCorporationNumberInput(), "123456789");
      await user.tab();
      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalled();
      });
      await user.click(getContinueButton());

      await waitFor(() => {
        expect(getBusinessNameInput()).toBeVisible();
      });
    }

    it("renders all business details form fields", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep2(user);

      expect(getBusinessNameInput()).toBeVisible();
      expect(getBusinessNameInput()).toBeEnabled();
      expect(getFirstTaxYearInput()).toBeVisible();
      expect(getFirstTaxYearInput()).toBeEnabled();
      expect(screen.getByText("Revenue Range")).toBeVisible();
      expect(getRevenueRangeTrigger()).toBeVisible();
      expect(getContinueButton()).toBeVisible();
      expect(getContinueButton()).toBeEnabled();
      expect(getBackButton()).toBeVisible();
      expect(getBackButton()).toBeEnabled();
    });

    it("shows validation error for empty business name on blur", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep2(user);

      const businessNameInput = getBusinessNameInput();
      await user.click(businessNameInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Required")).toBeInTheDocument();
      });
    });

    it("shows validation error for business name exceeding max length", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep2(user);

      const businessNameInput = getBusinessNameInput();
      await user.type(businessNameInput, "a".repeat(101));
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Max 100 characters")).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid tax year format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep2(user);

      const taxYearInput = getFirstTaxYearInput();
      await user.type(taxYearInput, "20");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Must be a valid year")).toBeInTheDocument();
      });
    });

    it("only allows numeric input in first tax year field", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep2(user);

      const taxYearInput = getFirstTaxYearInput();
      assertHtmlInputElement(taxYearInput);

      await user.type(taxYearInput, "abc2024def");

      expect(taxYearInput.value).toBe("2024");
    });

    it("navigates back to step 1 when back button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep2(user);

      await user.click(getBackButton());

      await waitFor(() => {
        expect(getFirstNameInput()).toBeVisible();
      });
    });

    it("preserves step 1 data when navigating back", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep2(user);

      await user.click(getBackButton());

      await waitFor(() => {
        const firstNameInput = getFirstNameInput();
        assertHtmlInputElement(firstNameInput);
        expect(firstNameInput.value).toBe("John");
      });
    });

    it("advances to step 3 when form is submitted with valid data", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep2(user);

      await user.type(getBusinessNameInput(), "Acme Inc.");
      await user.type(getFirstTaxYearInput(), "2020");

      // Select revenue range - listbox appears in a portal so we need to wait for it
      await user.click(getRevenueRangeTrigger());
      const listbox = await screen.findByRole("listbox");
      await user.click(within(listbox).getByText("$100K - $500K"));

      await user.click(getContinueButton());

      await waitFor(() => {
        expect(screen.getByText("Congratulations!")).toBeVisible();
      });
    });
  });

  describe.skip("Step 3: Finished Form", () => {
    async function advanceToStep3(user: ReturnType<typeof userEvent.setup>) {
      mockedValidateCorporationNumber.mockResolvedValue({
        corporationNumber: "123456789",
        valid: true,
      });
      mockedCreateProfileDetails.mockResolvedValue(void 0);

      // Fill step 1
      await user.type(getFirstNameInput(), "John");
      await user.type(getLastNameInput(), "Doe");
      await user.type(getPhoneInput(), "+11234567890");
      await user.type(getCorporationNumberInput(), "123456789");
      await user.tab();
      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalled();
      });
      await user.click(getContinueButton());

      await waitFor(() => {
        expect(getBusinessNameInput()).toBeVisible();
      });

      // Fill step 2 - listbox appears in a portal so we need to wait for it
      await user.type(getBusinessNameInput(), "Acme Inc.");
      await user.type(getFirstTaxYearInput(), "2020");
      await user.click(getRevenueRangeTrigger());
      const listbox = await screen.findByRole("listbox");
      await user.click(within(listbox).getByText("$100K - $500K"));
      await user.click(getContinueButton());

      await waitFor(() => {
        expect(screen.getByText("Congratulations!")).toBeVisible();
      });
    }

    it("renders completion message and buttons", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep3(user);

      expect(screen.getByText("Congratulations!")).toBeVisible();
      expect(
        screen.getByText("You have successfully completed the onboarding process.")
      ).toBeVisible();
      expect(getBackButton()).toBeVisible();
      expect(getGoToDashboardButton()).toBeVisible();
    });

    it("navigates back to step 2 when back button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep3(user);

      await user.click(getBackButton());

      await waitFor(() => {
        expect(getBusinessNameInput()).toBeVisible();
      });
    });

    it("preserves step 2 data when navigating back", async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);
      await advanceToStep3(user);

      await user.click(getBackButton());

      await waitFor(() => {
        const businessNameInput = getBusinessNameInput();
        assertHtmlInputElement(businessNameInput);
        expect(businessNameInput.value).toBe("Acme Inc.");
      });
    });
  });

  describe("Step Indicator", () => {
    it("shows step 1 indicator initially", () => {
      renderWithProviders(<OnboardingPage />);

      expect(screen.getByText(/Step 1: Profile/)).toBeVisible();
    });

    it("shows step 2 indicator after advancing", async () => {
      mockedValidateCorporationNumber.mockResolvedValue({
        corporationNumber: "123456789",
        valid: true,
      });
      mockedCreateProfileDetails.mockResolvedValue(void 0);

      const user = userEvent.setup();
      renderWithProviders(<OnboardingPage />);

      await user.type(getFirstNameInput(), "John");
      await user.type(getLastNameInput(), "Doe");
      await user.type(getPhoneInput(), "+11234567890");
      await user.type(getCorporationNumberInput(), "123456789");
      await user.tab();
      await waitFor(() => {
        expect(mockedValidateCorporationNumber).toHaveBeenCalled();
      });
      await user.click(getContinueButton());

      await waitFor(() => {
        expect(screen.getByText(/Step 2: Business Details/)).toBeVisible();
      });
    });
  });
});
