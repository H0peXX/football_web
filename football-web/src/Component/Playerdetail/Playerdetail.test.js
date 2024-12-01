describe("PlayerDetail Component", () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/players/*", {
            statusCode: 200,
            body: {
                email: "testplayer@example.com",
                firstname: "John",
                lastname: "Doe",
                position: "Midfielder",
                role: "Player",
                image: "", // Base64 or URL
            },
        }).as("getPlayer");

        cy.intercept("GET", "/api/comments/*", {
            statusCode: 200,
            body: [
                {
                    id: 1,
                    email: "commenter@example.com",
                    comment: "Great player!",
                    created_at: new Date().toISOString(),
                },
            ],
        }).as("getComments");

        cy.visit("/player-detail"); // Update with the actual route to PlayerDetail
    });

    it("displays player details", () => {
        cy.wait("@getPlayer");
        cy.get("h2").contains("John Doe"); // Verify player name
        cy.get("p").contains("Position: Midfielder"); // Verify player position
    });

    it("displays comments", () => {
        cy.wait("@getComments");
        cy.get(".comments").contains("Great player!");
        cy.get(".comments").contains("commenter@example.com");
    });

    it("allows posting a comment", () => {
        cy.intercept("POST", "/api/comments", {
            statusCode: 201,
            body: {
                id: 2,
                email: "user@example.com",
                comment: "Amazing!",
                created_at: new Date().toISOString(),
            },
        }).as("postComment");

        cy.get("textarea").type("Amazing!");
        cy.get("button").contains("Post Comment").click();

        cy.wait("@postComment");
        cy.get(".comments").contains("Amazing!");
    });

    it("allows editing a comment", () => {
        cy.get(".comments")
            .contains("Great player!")
            .siblings("button")
            .contains("Edit")
            .click();

        cy.get("textarea").clear().type("Awesome player!");
        cy.get("button").contains("Save").click();

        cy.get(".comments").contains("Awesome player!");
    });

    it("allows deleting a comment", () => {
        cy.intercept("DELETE", "/api/comments/*", { statusCode: 200 }).as("deleteComment");

        cy.get(".comments")
            .contains("Great player!")
            .siblings("button")
            .contains("Delete")
            .click();

        cy.wait("@deleteComment");
        cy.get(".comments").should("not.contain", "Great player!");
    });
});
