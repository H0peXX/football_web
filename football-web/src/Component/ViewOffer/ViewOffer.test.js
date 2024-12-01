describe("ViewOffers Component", () => {
    const mockUserEmail = "player@example.com";
    const mockOffers = [
        {
            id: 1,
            senderEmail: "coach1@example.com",
            message: "Join our team!",
            created_at: "2024-12-01T12:00:00Z",
        },
        {
            id: 2,
            senderEmail: "coach2@example.com",
            message: "We want you to play for us!",
            created_at: "2024-12-02T15:30:00Z",
        },
    ];

    beforeEach(() => {
        // Mock the API for fetching user details
        cy.intercept("GET", "http://localhost:5000", {
            statusCode: 200,
            body: {
                valid: true,
                email: mockUserEmail,
            },
        }).as("getUserDetails");

        // Mock the API for fetching offers
        cy.intercept("GET", `http://localhost:5000/offers/player/${mockUserEmail}`, {
            statusCode: 200,
            body: mockOffers,
        }).as("getOffers");

        cy.visit(`/view-offers/${mockUserEmail}`);
        cy.wait("@getUserDetails");
        cy.wait("@getOffers");
    });

    it("displays the loading state initially", () => {
        cy.contains("Loading...");
    });

    it("displays offers when available", () => {
        cy.wait("@getOffers");

        cy.get(".offer-item").should("have.length", 2);

        cy.get(".offer-item").first().within(() => {
            cy.contains("From: coach1@example.com");
            cy.contains("Join our team!");
            cy.contains("Sent on: 12/1/2024, 12:00:00 PM");
        });

        cy.get(".offer-item").last().within(() => {
            cy.contains("From: coach2@example.com");
            cy.contains("We want you to play for us!");
            cy.contains("Sent on: 12/2/2024, 3:30:00 PM");
        });
    });

    it("handles accepting an offer", () => {
        cy.wait("@getOffers");

        cy.get(".offer-item").first().within(() => {
            cy.contains("Accept").click();
        });

        cy.wait("@getOffers");

        cy.get(".offer-item").should("have.length", 1); // One offer should be removed after accepting
        cy.contains("From: coach2@example.com"); // Only the second offer remains
    });

    it("handles rejecting an offer", () => {
        cy.wait("@getOffers");

        cy.get(".offer-item").last().within(() => {
            cy.contains("Reject").click();
        });

        cy.wait("@getOffers");

        cy.get(".offer-item").should("have.length", 1); // One offer should be removed after rejecting
        cy.contains("From: coach1@example.com"); // Only the first offer remains
    });

    it("shows message when no offers are available", () => {
        cy.intercept("GET", `http://localhost:5000/offers/player/${mockUserEmail}`, {
            statusCode: 200,
            body: [],
        }).as("getEmptyOffers");

        cy.visit(`/view-offers/${mockUserEmail}`);
        cy.wait("@getUserDetails");
        cy.wait("@getEmptyOffers");

        cy.contains("No offers available for this player.");
    });

    it("displays alert if user is not authorized to view the page", () => {
        const unauthorizedUserEmail = "otherplayer@example.com";
        cy.intercept("GET", `http://localhost:5000/offers/player/${unauthorizedUserEmail}`, {
            statusCode: 200,
            body: [],
        }).as("getUnauthorized");

        cy.visit(`/view-offers/${unauthorizedUserEmail}`);
        cy.wait("@getUnauthorized");

        cy.on("window:alert", (msg) => {
            expect(msg).to.equal("You are not authorized to view this page.");
        });
    });
});
