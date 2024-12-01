describe("PlayerListing Component", () => {
    beforeEach(() => {
        cy.intercept("GET", "http://localhost:5000/players", {
            statusCode: 200,
            body: [
                {
                    email: "john.doe@example.com",
                    firstname: "John",
                    lastname: "Doe",
                    image: "", // Base64 encoded string or empty
                },
                {
                    email: "jane.smith@example.com",
                    firstname: "Jane",
                    lastname: "Smith",
                    image: "", // Base64 encoded string or empty
                },
            ],
        }).as("getPlayers");

        cy.visit("/players"); // Update this route to match your app's routing
    });

    it("displays a loading indicator", () => {
        cy.contains("Loading...");
    });

    it("displays players after loading", () => {
        cy.wait("@getPlayers");

        cy.get(".player-card").should("have.length", 2);

        cy.get(".player-card")
            .first()
            .within(() => {
                cy.get("h2").contains("John Doe");
                cy.get("p").contains("john.doe@example.com");
            });

        cy.get(".player-card")
            .last()
            .within(() => {
                cy.get("h2").contains("Jane Smith");
                cy.get("p").contains("jane.smith@example.com");
            });
    });

    it("links to player detail pages", () => {
        cy.wait("@getPlayers");

        cy.get(".player-card-link")
            .first()
            .should("have.attr", "href", "/players/john.doe%40example.com");
    });

    it("handles no players gracefully", () => {
        cy.intercept("GET", "http://localhost:5000/players", {
            statusCode: 200,
            body: [],
        }).as("getNoPlayers");

        cy.visit("/players");
        cy.wait("@getNoPlayers");

        cy.contains("No players found!");
    });
});
