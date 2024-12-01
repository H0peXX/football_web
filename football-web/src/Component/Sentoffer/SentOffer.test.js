describe("SentOffers Component", () => {
    const mockUserEmail = "coach@example.com";
    const mockOffers = [
        {
            id: 1,
            receiverEmail: "player1@example.com",
            message: "Great offer!",
            created_at: "2024-12-01T12:00:00Z",
        },
        {
            id: 2,
            receiverEmail: "player2@example.com",
            message: "Let's play together!",
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
                role: "coach",
            },
        }).as("getUserDetails");

        // Mock the API for fetching sent offers
        cy.intercept("GET", `http://localhost:5000/offers/sent/${mockUserEmail}`, {
            statusCode: 200,
            body: mockOffers,
        }).as("getOffers");

        cy.visit("/sent-offers");
        cy.wait("@getUserDetails");
        cy.wait("@getOffers");
    });

    it("displays the loading state initially", () => {
        cy.contains("Loading...");
    });

    it("displays sent offers once loaded", () => {
        cy.wait("@getOffers");

        cy.get(".offer-item").should("have.length", 2);

        cy.get(".offer-item").first().within(() => {
            cy.contains("To: player1@example.com");
            cy.contains("Great offer!");
            cy.contains("Sent on: 12/1/2024, 12:00:00 PM");
        });

        cy.get(".offer-item").last().within(() => {
            cy.contains("To: player2@example.com");
            cy.contains("Let's play together!");
            cy.contains("Sent on: 12/2/2024, 3:30:00 PM");
        });
    });

    it("handles editing an offer", () => {
        cy.wait("@getOffers");

        cy.get(".offer-item").first().within(() => {
            cy.contains("Edit").click();
            cy.get("textarea").clear().type("Updated message");
            cy.contains("Save").click();
        });

        cy.get(".offer-item").first().within(() => {
            cy.contains("Updated message");
        });
    });

    it("handles deleting an offer", () => {
        cy.wait("@getOffers");

        cy.get(".offer-item").first().within(() => {
            cy.contains("Delete").click();
        });

        cy.on("window:confirm", () => true); // Confirm the delete prompt

        cy.wait("@getOffers");

        cy.get(".offer-item").should("have.length", 1);
        cy.contains("To: player2@example.com"); // Only one offer left
    });

    it("displays a message when no offers are available", () => {
        cy.intercept("GET", `http://localhost:5000/offers/sent/${mockUserEmail}`, {
            statusCode: 200,
            body: [],
        }).as("getEmptyOffers");

        cy.visit("/sent-offers");
        cy.wait("@getUserDetails");
        cy.wait("@getEmptyOffers");

        cy.contains("No offers sent yet.");
    });
});
